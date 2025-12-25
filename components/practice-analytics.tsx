"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'
import { Clock, TrendingUp, Target, Calendar } from "lucide-react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"

interface PracticeRecord {
  id: string
  topic: string
  difficulty: string
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  timeSpent: number
  date: string
  questions: Array<{
    id: string
    question: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
    explanation?: string
  }>
}

interface PracticeAnalyticsProps {
  records: PracticeRecord[]
}

export function PracticeAnalytics({ records }: PracticeAnalyticsProps) {
  // Date range state for study time chart
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | '90d'>('14d')

  // Generate demo data only once when component mounts (won't regenerate on re-renders)
  const demoRecords = useMemo(() => generateDemoRecords(), [])

  // Prepare learning curve data
  const learningCurveData = demoRecords
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((record) => ({
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      accuracy: record.accuracy,
      questions: record.totalQuestions
    }))

  // Calculate total statistics
  const totalQuestions = demoRecords.reduce((sum, r) => sum + r.totalQuestions, 0)
  const totalCorrect = demoRecords.reduce((sum, r) => sum + r.correctAnswers, 0)
  const totalTime = demoRecords.reduce((sum, r) => sum + r.timeSpent, 0)
  const averageAccuracy = demoRecords.length > 0 ? (totalCorrect / totalQuestions) * 100 : 0

  // Prepare heatmap data (last 15 days only)
  const heatmapData = generateHeatmapData(demoRecords, 15)

  // Calculate time statistics by date with range filter
  const getRangeDays = () => {
    switch (timeRange) {
      case '7d': return 7
      case '14d': return 14
      case '30d': return 30
      case '90d': return 90
      default: return 14
    }
  }

  const timeByDate = demoRecords.reduce((acc, record) => {
    const date = new Date(record.date).toLocaleDateString()
    acc[date] = (acc[date] || 0) + record.timeSpent
    return acc
  }, {} as Record<string, number>)

  const timeData = Object.entries(timeByDate)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-getRangeDays())
    .map(([date, time]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: time
    }))

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-3xl font-bold text-foreground mt-2">{totalQuestions}</p>
              </div>
              <Target className="h-10 w-10 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-secondary/5 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Accuracy</p>
                <p className="text-3xl font-bold text-foreground mt-2">{averageAccuracy.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-secondary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-accent/5 to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-3xl font-bold text-foreground mt-2">{formatTime(totalTime)}</p>
              </div>
              <Clock className="h-10 w-10 text-accent opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Practice Sessions</p>
                <p className="text-3xl font-bold text-foreground mt-2">{records.length}</p>
              </div>
              <Calendar className="h-10 w-10 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Curve Chart */}
      <Card className="border-border/50 bg-gradient-to-br from-card via-card to-green-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Learning Curve
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track your accuracy improvement over time
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Average</p>
              <p className="text-3xl font-bold text-green-600">{averageAccuracy.toFixed(0)}%</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={learningCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(34, 197, 94)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="rgb(34, 197, 94)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                formatter={(value: number) => [`${value}%`, 'Accuracy']}
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="rgb(34, 197, 94)"
                strokeWidth={3}
                fill="url(#colorAccuracy)"
                dot={(props: any) => {
                  const { cx, cy } = props
                  return (
                    <rect
                      x={cx - 4}
                      y={cy - 4}
                      width={8}
                      height={8}
                      fill="rgb(34, 197, 94)"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                      rx={1}
                    />
                  )
                }}
                activeDot={(props: any) => {
                  const { cx, cy } = props
                  return (
                    <rect
                      x={cx - 5}
                      y={cy - 5}
                      width={10}
                      height={10}
                      fill="rgb(34, 197, 94)"
                      rx={1}
                    />
                  )
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Study Time Statistics */}
      <Card className="border-border/50 bg-gradient-to-br from-card via-card to-green-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Clock className="h-6 w-6 text-green-600" />
                Study Time
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Daily practice duration
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                <Button
                  variant={timeRange === '7d' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('7d')}
                  className="h-7 px-3 text-xs"
                >
                  7D
                </Button>
                <Button
                  variant={timeRange === '14d' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('14d')}
                  className="h-7 px-3 text-xs"
                >
                  14D
                </Button>
                <Button
                  variant={timeRange === '30d' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('30d')}
                  className="h-7 px-3 text-xs"
                >
                  30D
                </Button>
                <Button
                  variant={timeRange === '90d' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('90d')}
                  className="h-7 px-3 text-xs"
                >
                  90D
                </Button>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-3xl font-bold text-green-600">{formatTime(totalTime)}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={timeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTimeBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(34, 197, 94)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="rgb(34, 197, 94)" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}m`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                formatter={(value: number) => [`${value} min`, 'Study Time']}
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
              />
              <Bar
                dataKey="time"
                fill="url(#colorTimeBar)"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Practice Heatmap */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {heatmapData.reduce((sum, day) => sum + day.count, 0)} contributions in the last 15 days
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Less</span>
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-muted border border-border/20" />
                <div className="w-2.5 h-2.5 rounded-sm border border-border/20" style={{ backgroundColor: 'rgb(14, 68, 41)' }} />
                <div className="w-2.5 h-2.5 rounded-sm border border-border/20" style={{ backgroundColor: 'rgb(0, 109, 50)' }} />
                <div className="w-2.5 h-2.5 rounded-sm border border-border/20" style={{ backgroundColor: 'rgb(38, 166, 65)' }} />
                <div className="w-2.5 h-2.5 rounded-sm border border-border/20" style={{ backgroundColor: 'rgb(57, 211, 83)' }} />
              </div>
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {/* Day Labels */}
            <div className="flex flex-col justify-around text-right pr-2" style={{ paddingTop: '18px' }}>
              <span className="text-[11px] text-muted-foreground h-[14px] leading-[14px]">Mon</span>
              <span className="text-[11px] text-transparent h-[14px] leading-[14px]">Tue</span>
              <span className="text-[11px] text-muted-foreground h-[14px] leading-[14px]">Wed</span>
              <span className="text-[11px] text-transparent h-[14px] leading-[14px]">Thu</span>
              <span className="text-[11px] text-muted-foreground h-[14px] leading-[14px]">Fri</span>
              <span className="text-[11px] text-transparent h-[14px] leading-[14px]">Sat</span>
              <span className="text-[11px] text-transparent h-[14px] leading-[14px]">Sun</span>
            </div>

            {/* Heatmap Grid */}
            <div className="flex-1">
              {/* Month labels at top */}
              <div className="flex gap-[4px] mb-2 h-4">
                {Array.from({ length: Math.ceil(heatmapData.length / 7) }).map((_, weekIdx) => {
                  const firstDayOfWeek = heatmapData[weekIdx * 7]
                  if (!firstDayOfWeek) return null

                  const date = new Date(firstDayOfWeek.fullDate)
                  const showMonth = date.getDate() <= 7 || weekIdx === 0
                  return (
                    <div key={weekIdx} className="text-[11px] text-muted-foreground" style={{ width: '14px' }}>
                      {showMonth ? date.toLocaleDateString('en-US', { month: 'short' }) : ''}
                    </div>
                  )
                })}
              </div>

              {/* Grid of contribution boxes */}
              <div className="flex gap-[4px]">
                {Array.from({ length: Math.ceil(heatmapData.length / 7) }).map((_, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[4px]">
                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                      const dataIdx = weekIdx * 7 + dayIdx
                      const day = heatmapData[dataIdx]

                      if (!day) return <div key={dayIdx} className="w-[14px] h-[14px]" />

                      return (
                        <div
                          key={dayIdx}
                          className="w-[14px] h-[14px] rounded-sm border border-border/20 relative group cursor-pointer transition-all hover:border-primary/50 hover:ring-1 hover:ring-primary/50"
                          style={{
                            backgroundColor: getHeatmapColor(day.count)
                          }}
                          title={`${day.date}: ${day.count} questions`}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                            <div className="bg-popover text-popover-foreground text-xs px-3 py-2 rounded-md shadow-lg border border-border whitespace-nowrap">
                              <div className="font-semibold">{day.count} questions on {day.date}</div>
                              {day.count > 0 && <div className="text-muted-foreground text-[10px]">{day.accuracy}% accuracy</div>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function generateHeatmapData(records: PracticeRecord[], days: number = 15) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const heatmap: { date: string; fullDate: string; count: number; accuracy: number; dayOfWeek: number }[] = []

  // Go back to get the start date
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - days + 1)

  // Adjust to start from Monday of that week
  const dayOfWeek = startDate.getDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  startDate.setDate(startDate.getDate() - daysToMonday)

  // Calculate end date (ensure it covers today and ends on Sunday)
  const endDate = new Date(today)
  const todayDayOfWeek = today.getDay()
  const daysToSunday = todayDayOfWeek === 0 ? 0 : 7 - todayDayOfWeek
  endDate.setDate(today.getDate() + daysToSunday)

  // Generate data from start to end
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateStr = currentDate.toLocaleDateString()
    const dayRecords = records.filter(r =>
      new Date(r.date).toLocaleDateString() === dateStr
    )

    const count = dayRecords.reduce((sum, r) => sum + r.totalQuestions, 0)
    const correct = dayRecords.reduce((sum, r) => sum + r.correctAnswers, 0)
    const accuracy = count > 0 ? Math.round((correct / count) * 100) : 0

    heatmap.push({
      date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: currentDate.toISOString(),
      count,
      accuracy,
      dayOfWeek: currentDate.getDay()
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return heatmap
}

function getHeatmapColor(count: number): string {
  // GitHub-style green colors
  if (count === 0) return 'rgb(235, 237, 240)' // Very light gray-green for empty days
  if (count <= 3) return 'rgb(14, 68, 41)' // Level 1
  if (count <= 6) return 'rgb(0, 109, 50)' // Level 2
  if (count <= 9) return 'rgb(38, 166, 65)' // Level 3
  return 'rgb(57, 211, 83)' // Level 4
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

function generateDemoRecords(): PracticeRecord[] {
  const demoRecords: PracticeRecord[] = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 14) // Last 15 days (including today)

  // Generate 15 days of practice data with VERY high density
  for (let i = 0; i < 15; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    const dayOfWeek = date.getDay()
    const skipProbability = Math.random()

    // Very high practice frequency - aim for ~90% of days filled
    // Skip Sunday occasionally (10% chance)
    if (dayOfWeek === 0 && skipProbability > 0.9) continue

    // Skip Saturday occasionally (10% chance)
    if (dayOfWeek === 6 && skipProbability > 0.9) continue

    // Almost never skip weekdays (2% chance)
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && skipProbability > 0.98) continue

    // Simulate learning improvement over time
    const progressFactor = i / 15 // 0 to 1
    const baseAccuracy = 60 + (progressFactor * 20) // 60% to 80% improvement
    const variance = (Math.random() - 0.5) * 12 // ±6%

    // Vary questions per day - sometimes multiple sessions per day
    // 40% chance of 2 sessions for very dense heatmap
    const sessionsPerDay = Math.random() > 0.6 ? 2 : 1

    for (let session = 0; session < sessionsPerDay; session++) {
      // 10-25 questions per session for very active appearance
      const totalQuestions = Math.floor(Math.random() * 16) + 10
      const targetAccuracy = Math.min(95, Math.max(50, baseAccuracy + variance))
      const correctAnswers = Math.round((totalQuestions * targetAccuracy) / 100)
      const accuracy = Math.round((correctAnswers / totalQuestions) * 100)

      // Time spent: 30-70 minutes per session
      const baseTime = 50 - (progressFactor * 8) // 50 to 42 minutes average
      const timeSpent = Math.max(30, Math.floor(baseTime + (Math.random() - 0.5) * 40))

      demoRecords.push({
        id: `demo-${i}-${session}`,
        topic: ['Data Structures', 'Algorithms', 'System Design', 'Database', 'Networks'][Math.floor(Math.random() * 5)],
        difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
        totalQuestions,
        correctAnswers,
        accuracy,
        timeSpent,
        date: date.toISOString(),
        questions: Array(totalQuestions).fill(null).map((_, idx) => ({
          id: `demo-q-${i}-${session}-${idx}`,
          question: `Demo question ${idx + 1}`,
          userAnswer: idx < correctAnswers ? 'Correct' : 'Incorrect',
          correctAnswer: 'Correct',
          isCorrect: idx < correctAnswers,
          explanation: 'This is a demo explanation.'
        }))
      })
    }
  }

  return demoRecords
}
