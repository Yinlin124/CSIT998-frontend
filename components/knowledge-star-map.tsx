"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { KnowledgeNode, KnowledgeGraphData } from "@/lib/knowledge-graph"
import { Card } from "@/components/ui/card"
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KnowledgeStarMapProps {
  graphData: KnowledgeGraphData
  onNodeClick: (node: KnowledgeNode) => void
  highlightedNodes?: string[] // Node IDs to highlight
}

export function KnowledgeStarMap({ graphData, onNodeClick, highlightedNodes = [] }: KnowledgeStarMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        const { width, height } = svgRef.current.parentElement.getBoundingClientRect()
        setDimensions({ width: width || 800, height: height || 600 })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const { width, height } = dimensions

    // Obsidian-style simulation with loose clustering
    const simulation = d3.forceSimulation(graphData.nodes as any)
      .force("link", d3.forceLink(graphData.links)
        .id((d: any) => d.id)
        .distance(100)
        .strength(0.3)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50))
      .alphaDecay(0.02)
      .velocityDecay(0.3)

    // Create container group
    const g = svg.append("g")

    // Add zoom behavior with text visibility control
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)

        // Control text visibility based on zoom level
        const scale = event.transform.k
        const labels = g.selectAll("text")

        if (scale < 0.6) {
          // Hide all text when zoomed out
          labels.style("opacity", "0")
        } else if (scale < 1) {
          // Fade text when partially zoomed out
          labels.style("opacity", String((scale - 0.6) / 0.4 * 0.7))
        } else {
          // Show text at normal zoom or zoomed in
          labels.style("opacity", "0.7")
        }
      })

    svg.call(zoom as any)

    // Set initial zoom to fit all nodes in view and center them
    const initialScale = 0.8
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(initialScale)
      .translate(-width / 2, -height / 2)

    svg.call(zoom.transform as any, initialTransform)

    // Store zoom instance for controls
    const zoomBehavior = zoom

    // Draw links with more visible style
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graphData.links)
      .join("line")
      .attr("stroke", "#d1d5db")
      .attr("stroke-opacity", 0.8)
      .attr("stroke-width", 2.5)

    // Create node groups
    const node = g.append("g")
      .selectAll<SVGGElement, KnowledgeNode>("g")
      .data(graphData.nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(d3.drag<SVGGElement, KnowledgeNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any
      )
      .on("click", (event, d) => {
        event.stopPropagation()
        onNodeClick(d)
      })
      .on("mouseenter", function(event, d) {
        // Highlight connected nodes
        const connectedNodeIds = new Set<string>()
        connectedNodeIds.add(d.id)

        graphData.links.forEach(link => {
          if (link.source === d.id || (typeof link.source === 'object' && (link.source as any).id === d.id)) {
            const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id
            connectedNodeIds.add(targetId)
          }
          if (link.target === d.id || (typeof link.target === 'object' && (link.target as any).id === d.id)) {
            const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id
            connectedNodeIds.add(sourceId)
          }
        })

        // Fade non-connected elements
        node.style("opacity", (n: KnowledgeNode) => connectedNodeIds.has(n.id) ? 1 : 0.2)
        link.style("opacity", (l: any) => {
          const sourceId = typeof l.source === 'string' ? l.source : l.source.id
          const targetId = typeof l.target === 'string' ? l.target : l.target.id
          return connectedNodeIds.has(sourceId) && connectedNodeIds.has(targetId) ? 0.5 : 0.05
        })
      })
      .on("mouseleave", function() {
        // Reset opacity
        node.style("opacity", 1)
        link.style("opacity", 0.2)
      })

    // Calculate node colors (Obsidian-style muted grays with color hints)
    const getNodeColor = (weaknessLevel: number, isHighlighted: boolean) => {
      if (isHighlighted) return "#6366f1" // indigo for highlighted
      if (weaknessLevel >= 70) return "#ef4444" // red
      if (weaknessLevel >= 50) return "#f97316" // orange
      if (weaknessLevel >= 30) return "#eab308" // yellow
      return "#6b7280" // gray
    }

    // Draw outer glow for highlighted nodes
    node.filter((d: KnowledgeNode) => highlightedNodes.includes(d.id))
      .append("circle")
      .attr("r", 28)
      .attr("fill", "none")
      .attr("stroke", "#6366f1")
      .attr("stroke-width", 3)
      .attr("opacity", 0.5)
      .attr("class", "animate-pulse")

    // Draw node circles (Obsidian style - size varies by weakness, weaker nodes are larger)
    node.append("circle")
      .attr("r", (d: KnowledgeNode) => 10 + (d.weaknessLevel / 100) * 18)
      .attr("fill", (d: KnowledgeNode) => getNodeColor(d.weaknessLevel, highlightedNodes.includes(d.id)))
      .attr("stroke", "#1f2937")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0px 0px 4px rgba(0,0,0,0.5))")

    // Add labels (Obsidian style - smaller and more subtle)
    const labels = node.append("text")
      .attr("dy", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "9px")
      .style("font-weight", "500")
      .style("fill", "#9ca3af")
      .style("opacity", "0.7")
      .style("pointer-events", "none")
      .style("user-select", "none")
      .text((d: KnowledgeNode) => {
        return d.name.length > 18 ? d.name.substring(0, 16) + '...' : d.name
      })

    // Add tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "absolute hidden bg-[#1f2937] text-gray-200 rounded-lg shadow-xl p-3 text-sm pointer-events-none z-50 border border-gray-700")
      .style("max-width", "250px")

    node.on("mouseenter.tooltip", function(event, d: KnowledgeNode) {
      // Enlarge node on hover
      d3.select(this).select("circle")
        .transition()
        .duration(200)
        .attr("r", (d: KnowledgeNode) => (10 + (d.weaknessLevel / 100) * 18) * 1.6)

      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
        .html(`
          <div class="space-y-1">
            <div class="font-semibold text-white">${d.name}</div>
            <div class="text-xs text-gray-400">${d.category}</div>
            <div class="mt-2 space-y-0.5 text-xs">
              <div class="flex justify-between gap-4">
                <span class="text-gray-400">Weakness:</span>
                <span class="font-medium text-white">${d.weaknessLevel}%</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-400">Correct Rate:</span>
                <span class="font-medium text-white">${d.correctRate}%</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-400">Questions:</span>
                <span class="font-medium text-white">${d.questionsAnswered}</span>
              </div>
            </div>
            <div class="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
              Click to generate questions
            </div>
          </div>
        `)
        .classed("hidden", false)
    })

    node.on("mouseleave.tooltip", function(event, d: KnowledgeNode) {
      d3.select(this).select("circle")
        .transition()
        .duration(200)
        .attr("r", (d: KnowledgeNode) => 10 + (d.weaknessLevel / 100) * 18)

      tooltip.classed("hidden", true)
    })

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: any, d: any) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // Zoom controls
    const handleZoomIn = () => {
      svg.transition().duration(300).call(zoomBehavior.scaleBy as any, 1.3)
    }

    const handleZoomOut = () => {
      svg.transition().duration(300).call(zoomBehavior.scaleBy as any, 0.7)
    }

    const handleReset = () => {
      svg.transition().duration(300).call(zoomBehavior.transform as any, d3.zoomIdentity)
    }

    // Store handlers for cleanup
    ;(svg.node() as any)._zoomHandlers = { handleZoomIn, handleZoomOut, handleReset }

    // Cleanup
    return () => {
      simulation.stop()
      tooltip.remove()
    }
  }, [graphData, dimensions, onNodeClick, highlightedNodes])

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current)
    const handlers = (svg.node() as any)?._zoomHandlers
    if (handlers?.handleZoomIn) handlers.handleZoomIn()
  }

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current)
    const handlers = (svg.node() as any)?._zoomHandlers
    if (handlers?.handleZoomOut) handlers.handleZoomOut()
  }

  const handleReset = () => {
    const svg = d3.select(svgRef.current)
    const handlers = (svg.node() as any)?._zoomHandlers
    if (handlers?.handleReset) handlers.handleReset()
  }

  return (
    <Card className="w-full h-full min-h-[600px] relative overflow-hidden border-gray-800" style={{ backgroundColor: '#1a1b1e' }}>
      {/* Top right controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-gray-800/80 border-gray-700 hover:bg-gray-700"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4 text-gray-400" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-gray-800/80 border-gray-700 hover:bg-gray-700"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4 text-gray-400" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-gray-800/80 border-gray-700 hover:bg-gray-700"
          onClick={handleReset}
        >
          <Maximize2 className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 space-y-2 text-xs border border-gray-700">
        <div className="font-semibold text-gray-200">Legend</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
          <span className="text-gray-400">Very Weak (70%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f97316]"></div>
          <span className="text-gray-400">Weak (50-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
          <span className="text-gray-400">Moderate (30-50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#6b7280]"></div>
          <span className="text-gray-400">Strong (&lt;30%)</span>
        </div>
      </div>

      {/* Bottom right attribution */}
      <div className="absolute bottom-4 right-4 z-10 text-gray-600 text-[10px] font-sans">
        Powered by React & D3
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ minHeight: "600px", background: "transparent" }}
      />
    </Card>
  )
}
