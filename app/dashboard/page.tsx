"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Brain, Sparkles, BookOpen, MessageSquare, Mic, TrendingUp, Clock, Target, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { practiceStorage } from "@/lib/practice-storage"

export default function DashboardPage() {
  const [practiceStats, setPracticeStats] = useState({
    completed: 0,
    totalQuestions: 0,
    averageAccuracy: 0,
    totalTime: 0,
  })

  useEffect(() => {
    const records = practiceStorage.getPracticeRecords()
    const totalCompleted = records.length
    const totalQuestions = records.reduce((sum, r) => sum + r.totalQuestions, 0)
    const totalTime = records.reduce((sum, r) => sum + r.timeSpent, 0)
    const averageAccuracy = records.length > 0
      ? Math.round(records.reduce((sum, r) => sum + r.accuracy, 0) / records.length)
      : 0

    setPracticeStats({
      completed: totalCompleted,
      totalQuestions,
      averageAccuracy,
      totalTime,
    })
  }, [])
  const modules = [
    {
      id: "practice",
      name: "Practice",
      icon: Brain,
      href: "/practice",
      color: "secondary",
      stats: { completed: practiceStats.completed, accuracy: practiceStats.averageAccuracy },
    },
    {
      id: "solver",
      name: "Solver",
      icon: Sparkles,
      href: "/solver",
      color: "primary",
      stats: { used: 23, accuracy: 94 },
    },
    {
      id: "mentor",
      name: "Mentor",
      icon: MessageSquare,
      href: "/dashboard",
      color: "accent",
      stats: { insights: 8, helpful: 100 },
    },
    {
      id: "library",
      name: "Library",
      icon: BookOpen,
      href: "/library",
      color: "secondary",
      stats: { articles: 15, topics: 3 },
    },
    {
      id: "speak",
      name: "Speak",
      icon: Mic,
      href: "/speak",
      color: "primary",
      stats: { minutes: 142, words: 87 },
    },
  ]

  const [progressData, setProgressData] = useState([
    { day: "Mon", value: 0, sessions: 0, timeSpent: 0 },
    { day: "Tue", value: 0, sessions: 0, timeSpent: 0 },
    { day: "Wed", value: 0, sessions: 0, timeSpent: 0 },
    { day: "Thu", value: 0, sessions: 0, timeSpent: 0 },
    { day: "Fri", value: 0, sessions: 0, timeSpent: 0 },
    { day: "Sat", value: 0, sessions: 0, timeSpent: 0 },
    { day: "Sun", value: 0, sessions: 0, timeSpent: 0 },
  ])

  useEffect(() => {
    const records = practiceStorage.getPracticeRecords()
    const today = new Date()
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Get the past 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (6 - i))
      return {
        dayName: dayNames[date.getDay()],
        dateStr: date.toDateString(),
      }
    })

    // Calculate data for each day
    const newProgressData = last7Days.map(({ dayName, dateStr }) => {
      const dayRecords = records.filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate.toDateString() === dateStr
      })

      const sessions = dayRecords.length
      const timeSpent = dayRecords.reduce((sum, r) => sum + r.timeSpent, 0)
      const totalQuestions = dayRecords.reduce((sum, r) => sum + r.totalQuestions, 0)

      // Value based on number of questions answered (0-100 scale)
      const value = Math.min(100, (totalQuestions / 10) * 100)

      return {
        day: dayName,
        value: Math.round(value),
        sessions,
        timeSpent,
      }
    })

    setProgressData(newProgressData)
  }, [practiceStats])

  const [recentActivity, setRecentActivity] = useState<Array<{
    type: string
    action: string
    time: string
    color: string
  }>>([])

  useEffect(() => {
    const records = practiceStorage.getPracticeRecords()
    const activities = records.slice(0, 5).map((record) => {
      const recordDate = new Date(record.date)
      const now = new Date()
      const diffMs = now.getTime() - recordDate.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      let timeStr = ""
      if (diffMins < 60) {
        timeStr = `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
      } else if (diffHours < 24) {
        timeStr = `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
      } else if (diffDays === 1) {
        timeStr = "Yesterday"
      } else {
        timeStr = `${diffDays} days ago`
      }

      return {
        type: "practice",
        action: `Completed ${record.totalQuestions} questions on ${record.topic}`,
        time: timeStr,
        color: record.accuracy >= 80 ? "primary" : record.accuracy >= 60 ? "secondary" : "accent",
      }
    })

    setRecentActivity(activities)
  }, [practiceStats])

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-20 border-r border-border/40 bg-card flex flex-col items-center py-6 gap-8">
        <Link href="/" className="flex items-center justify-center">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
        </Link>

        <div className="flex-1 flex flex-col gap-4">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Link key={module.id} href={module.href}>
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${
                    module.id === "mentor"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted/50 text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </Link>
            )
          })}
        </div>

        <Link href="/profile">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">JD</span>
            </div>
          </div>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="ml-20">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back! Here's your learning state</p>
              </div>
              <Button size="sm" className="gap-2">
                <Target className="h-4 w-4" />
                Set Goals
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-8 py-8">
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-border/50 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                      Practice
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">{practiceStats.averageAccuracy}%</p>
                    <p className="text-sm text-muted-foreground">Average Accuracy</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-secondary" />
                    </div>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary text-xs">
                      Sessions
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">{practiceStats.completed}</p>
                    <p className="text-sm text-muted-foreground">Practice Sessions</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">{practiceStats.totalQuestions}</p>
                    <p className="text-sm text-muted-foreground">Questions Answered</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">
                      {practiceStats.totalTime < 60
                        ? `${practiceStats.totalTime}m`
                        : `${Math.floor(practiceStats.totalTime / 60)}h ${practiceStats.totalTime % 60}m`}
                    </p>
                    <p className="text-sm text-muted-foreground">Learning Time</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Chart */}
            <Card className="border-border/50 bg-card">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">State of My Learning</h3>
                      <p className="text-sm text-muted-foreground">Your activity over the past week</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>

                  {/* Dot Grid Progress Chart */}
                  <div className="flex items-end justify-between gap-4 h-48">
                    {progressData.map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-3">
                        <div className="flex-1 flex items-end w-full">
                          <div
                            className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/30"
                            style={{ height: `${data.value}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">{data.day}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Module Status */}
              <Card className="border-border/50 bg-card">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-foreground">Module Overview</h3>

                    <div className="space-y-4">
                      {modules.map((module) => {
                        const Icon = module.icon
                        return (
                          <Link key={module.id} href={module.href}>
                            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer group">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`h-12 w-12 rounded-xl bg-${module.color}/20 flex items-center justify-center group-hover:scale-110 transition-transform`}
                                >
                                  <Icon className={`h-5 w-5 text-${module.color}`} />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{module.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {Object.entries(module.stats)[0][0]}: {Object.entries(module.stats)[0][1]}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-foreground">
                                  {Object.entries(module.stats)[1][1]}
                                  {Object.entries(module.stats)[1][0] === "accuracy" ? "%" : ""}
                                </p>
                                <p className="text-xs text-muted-foreground">{Object.entries(module.stats)[1][0]}</p>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-border/50 bg-card">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-foreground">Recent Activity</h3>
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-muted/20 rounded-xl">
                          <div
                            className={`h-10 w-10 rounded-xl bg-${activity.color}/20 flex items-center justify-center flex-shrink-0`}
                          >
                            <div className={`h-2 w-2 rounded-full bg-${activity.color}`} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium text-foreground">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-secondary/5">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-5 w-5 text-accent" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">Mentor Insight</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              You're excelling in problem-solving! Consider exploring advanced calculus to maintain
                              momentum.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
