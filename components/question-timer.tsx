"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { Card } from "@/components/ui/card"

interface QuestionTimerProps {
  startTime: Date | null
  isPaused?: boolean
}

export function QuestionTimer({ startTime, isPaused = false }: QuestionTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!startTime || isPaused) return

    const interval = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, isPaused])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = (seconds: number): string => {
    if (seconds < 60) return "text-primary"
    if (seconds < 180) return "text-secondary"
    return "text-destructive"
  }

  if (!startTime) return null

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="px-4 py-3 flex items-center gap-3">
        <Clock className={`h-5 w-5 ${getTimerColor(elapsedTime)}`} />
        <div>
          <p className="text-xs text-muted-foreground">Time Elapsed</p>
          <p className={`text-xl font-mono font-bold ${getTimerColor(elapsedTime)}`}>
            {formatTime(elapsedTime)}
          </p>
        </div>
      </div>
    </Card>
  )
}
