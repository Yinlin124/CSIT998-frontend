export interface KnowledgeNode {
  id: string
  name: string
  weaknessLevel: number // 0-100, higher means weaker
  correctRate: number // 0-100
  questionsAnswered: number
  prerequisites: string[] // IDs of prerequisite nodes
  followups: string[] // IDs of follow-up nodes
  category: string
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[]
  links: { source: string; target: string; type: 'prerequisite' | 'followup' }[]
}

// Extract unique knowledge points from questions data
export function extractKnowledgePoints(questionsData: any[]): string[] {
  const knowledgeSet = new Set<string>()
  questionsData.forEach(item => {
    if (item.question?.knowledge) {
      item.question.knowledge.forEach((k: string) => knowledgeSet.add(k))
    }
  })
  return Array.from(knowledgeSet)
}

// Define knowledge point relationships (prerequisites and follow-ups)
const knowledgeRelationships: Record<string, { prerequisites: string[], category: string }> = {
  // Basic concepts (no prerequisites)
  "absolute value": { prerequisites: [], category: "Basic Math" },
  "basic division": { prerequisites: [], category: "Basic Math" },
  "even and odd numbers": { prerequisites: [], category: "Basic Math" },
  "multiples": { prerequisites: [], category: "Basic Math" },
  "factors": { prerequisites: [], category: "Basic Math" },
  "square roots": { prerequisites: [], category: "Basic Math" },
  "exponents": { prerequisites: [], category: "Basic Math" },
  "powers": { prerequisites: ["exponents"], category: "Basic Math" },
  "fractions to decimals": { prerequisites: [], category: "Basic Math" },
  "equivalent fractions": { prerequisites: [], category: "Basic Math" },
  "factorial": { prerequisites: [], category: "Basic Math" },

  // Algebra
  "linear equations": { prerequisites: ["basic division"], category: "Algebra" },
  "linear inequalities": { prerequisites: ["linear equations"], category: "Algebra" },
  "linear functions": { prerequisites: ["linear equations", "slope of a line"], category: "Algebra" },
  "slope of a line": { prerequisites: ["linear equations"], category: "Algebra" },
  "systems of linear equations": { prerequisites: ["linear equations"], category: "Algebra" },
  "quadratic function": { prerequisites: ["linear functions", "exponents"], category: "Algebra" },
  "quadratic equations": { prerequisites: ["quadratic function"], category: "Algebra" },
  "quadratic inequalities": { prerequisites: ["quadratic equations"], category: "Algebra" },
  "extrema": { prerequisites: ["quadratic function"], category: "Algebra" },

  // Sequences
  "arithmetic sequence": { prerequisites: ["linear equations"], category: "Sequences" },
  "arithmetic sequences": { prerequisites: ["linear equations"], category: "Sequences" },
  "nth term": { prerequisites: ["arithmetic sequence"], category: "Sequences" },
  "geometric sequence": { prerequisites: ["arithmetic sequence", "exponents"], category: "Sequences" },
  "sequence summation": { prerequisites: ["geometric sequence"], category: "Sequences" },
  "number sequences": { prerequisites: [], category: "Sequences" },

  // Functions
  "function evaluation": { prerequisites: ["linear equations"], category: "Functions" },
  "monotonicity of functions": { prerequisites: ["function evaluation"], category: "Functions" },

  // Calculus
  "derivatives of polynomials": { prerequisites: ["quadratic function", "exponents"], category: "Calculus" },
  "basic integration": { prerequisites: ["derivatives of polynomials"], category: "Calculus" },

  // Trigonometry
  "trigonometric identities": { prerequisites: [], category: "Trigonometry" },

  // Geometry
  "types of angles": { prerequisites: [], category: "Geometry" },
  "properties of triangles": { prerequisites: ["types of angles"], category: "Geometry" },
  "area of a circle": { prerequisites: [], category: "Geometry" },
  "perimeter of polygons": { prerequisites: [], category: "Geometry" },

  // Logarithms
  "logarithms": { prerequisites: ["exponents"], category: "Logarithms" },
  "exponential form": { prerequisites: ["logarithms"], category: "Logarithms" },

  // Statistics
  "classical probability": { prerequisites: [], category: "Statistics" },
  "mean of data": { prerequisites: [], category: "Statistics" },
  "median": { prerequisites: ["mean of data"], category: "Statistics" },

  // Number Theory
  "prime numbers": { prerequisites: ["factors", "multiples"], category: "Number Theory" },
  "irrational numbers": { prerequisites: ["square roots"], category: "Number Theory" },
}

// Generate weakness levels and practice data for knowledge points
export function generateKnowledgeGraph(questionsData: any[]): KnowledgeGraphData {
  const knowledgePoints = extractKnowledgePoints(questionsData)

  // Create nodes with simulated weakness data
  const nodes: KnowledgeNode[] = knowledgePoints.map((name, index) => {
    const relationship = knowledgeRelationships[name] || { prerequisites: [], category: "Other" }

    // Simulate weakness levels (higher for more advanced topics)
    const baseWeakness = relationship.prerequisites.length * 15 + Math.random() * 30
    const weaknessLevel = Math.min(Math.round(baseWeakness), 95)

    // Simulate practice data
    const questionsAnswered = Math.floor(Math.random() * 20) + 5
    const correctRate = Math.max(10, Math.min(95, 100 - weaknessLevel + Math.random() * 20))

    return {
      id: name,
      name: name,
      weaknessLevel: weaknessLevel,
      correctRate: Math.round(correctRate),
      questionsAnswered: questionsAnswered,
      prerequisites: relationship.prerequisites,
      followups: [], // Will be calculated below
      category: relationship.category
    }
  })

  // Calculate follow-ups (reverse of prerequisites)
  nodes.forEach(node => {
    node.prerequisites.forEach(prereqId => {
      const prereqNode = nodes.find(n => n.id === prereqId)
      if (prereqNode && !prereqNode.followups.includes(node.id)) {
        prereqNode.followups.push(node.id)
      }
    })
  })

  // Create links from prerequisites
  const links: { source: string; target: string; type: 'prerequisite' | 'followup' }[] = []
  nodes.forEach(node => {
    node.prerequisites.forEach(prereqId => {
      if (nodes.find(n => n.id === prereqId)) {
        links.push({ source: prereqId, target: node.id, type: 'prerequisite' })
      }
    })
  })

  // Add additional cross-category connections to create a mesh network
  // Connect nodes within the same category
  const nodesByCategory = new Map<string, KnowledgeNode[]>()
  nodes.forEach(node => {
    if (!nodesByCategory.has(node.category)) {
      nodesByCategory.set(node.category, [])
    }
    nodesByCategory.get(node.category)?.push(node)
  })

  // Create connections within categories
  nodesByCategory.forEach((categoryNodes) => {
    if (categoryNodes.length > 1) {
      // Connect each node to 1-2 other nodes in the same category
      categoryNodes.forEach((node, index) => {
        // Connect to next node in category
        if (index < categoryNodes.length - 1) {
          const target = categoryNodes[index + 1]
          if (!links.find(l =>
            (l.source === node.id && l.target === target.id) ||
            (l.source === target.id && l.target === node.id)
          )) {
            links.push({ source: node.id, target: target.id, type: 'followup' })
          }
        }

        // Occasionally connect to a random node in the same category
        if (Math.random() > 0.7 && categoryNodes.length > 2) {
          const randomIndex = Math.floor(Math.random() * categoryNodes.length)
          if (randomIndex !== index) {
            const target = categoryNodes[randomIndex]
            if (!links.find(l =>
              (l.source === node.id && l.target === target.id) ||
              (l.source === target.id && l.target === node.id)
            )) {
              links.push({ source: node.id, target: target.id, type: 'followup' })
            }
          }
        }
      })
    }
  })

  // Add some cross-category connections for related topics
  const crossCategoryConnections = [
    ['linear equations', 'quadratic function'],
    ['exponents', 'logarithms'],
    ['derivatives of polynomials', 'quadratic function'],
    ['trigonometric identities', 'properties of triangles'],
    ['arithmetic sequence', 'geometric sequence'],
    ['mean of data', 'classical probability'],
    ['factors', 'prime numbers'],
  ]

  crossCategoryConnections.forEach(([source, target]) => {
    const sourceNode = nodes.find(n => n.id === source)
    const targetNode = nodes.find(n => n.id === target)
    if (sourceNode && targetNode) {
      if (!links.find(l =>
        (l.source === source && l.target === target) ||
        (l.source === target && l.target === source)
      )) {
        links.push({ source, target, type: 'followup' })
      }
    }
  })

  return { nodes, links }
}

// Get weakest knowledge points
export function getWeakestKnowledgePoints(graph: KnowledgeGraphData, limit: number = 10): KnowledgeNode[] {
  return [...graph.nodes]
    .sort((a, b) => b.weaknessLevel - a.weaknessLevel)
    .slice(0, limit)
}

// Get related knowledge points (prerequisites + follow-ups)
export function getRelatedKnowledgePoints(graph: KnowledgeGraphData, nodeId: string): {
  prerequisites: KnowledgeNode[]
  followups: KnowledgeNode[]
  current: KnowledgeNode | undefined
} {
  const node = graph.nodes.find(n => n.id === nodeId)
  if (!node) return { prerequisites: [], followups: [], current: undefined }

  const prerequisites = node.prerequisites
    .map(id => graph.nodes.find(n => n.id === id))
    .filter(Boolean) as KnowledgeNode[]

  const followups = node.followups
    .map(id => graph.nodes.find(n => n.id === id))
    .filter(Boolean) as KnowledgeNode[]

  return { prerequisites, followups, current: node }
}

// Filter questions by knowledge point
export function getQuestionsByKnowledge(questionsData: any[], knowledgePoint: string) {
  return questionsData.filter(item =>
    item.question?.knowledge?.includes(knowledgePoint)
  )
}

// Get questions by difficulty
export function filterQuestionsByDifficulty(questions: any[], difficulty: string) {
  return questions.filter(item =>
    item.question?.difficulty?.toLowerCase() === difficulty.toLowerCase()
  )
}
