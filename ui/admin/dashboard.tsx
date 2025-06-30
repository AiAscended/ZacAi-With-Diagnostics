"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Database,
  Activity,
  Settings,
  BookOpen,
  Calculator,
  Globe,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react"
import { systemManager } from "@/core/system/manager"
import { formatNumber, formatPercentage, formatDuration } from "@/utils/formatters"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const systemStats = systemManager.getSystemStats()
      setStats(systemStats)
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-pulse mx-auto mb-2" />
          <p>Loading system statistics...</p>
        </div>
      </div>
    )
  }

  const getModuleIcon = (moduleName: string) => {
    const icons: { [key: string]: any } = {
      vocabulary: BookOpen,
      mathematics: Calculator,
      facts: Globe,
      coding: Settings,
      philosophy: Brain,
    }
    return icons[moduleName] || Database
  }

  const getStatusColor = (successRate: number) => {
    if (successRate >= 0.9) return "text-green-600"
    if (successRate >= 0.7) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ZacAI Admin Dashboard</h1>
        <Badge variant={stats.initialized ? "default" : "destructive"}>
          {stats.initialized ? "System Online" : "System Offline"}
        </Badge>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.modules).length}</div>
            <p className="text-xs text-muted-foreground">
              {Object.values(stats.modules).filter((m: any) => m.successRate > 0.5).length} performing well
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(Object.values(stats.modules).reduce((sum: number, m: any) => sum + m.totalQueries, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Across all modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(
                Object.values(stats.modules).reduce((sum: number, m: any) => sum + m.successRate, 0) /
                  Object.keys(stats.modules).length,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Average across modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(
                Object.values(stats.modules).reduce((sum: number, m: any) => sum + m.averageResponseTime, 0) /
                  Object.keys(stats.modules).length,
              )}
            </div>
            <p className="text-xs text-muted-foreground">System-wide average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="cognitive">Cognitive Engine</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(stats.modules).map(([name, moduleStats]: [string, any]) => {
              const Icon = getModuleIcon(name)
              return (
                <Card key={name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      {name.charAt(0).toUpperCase() + name.slice(1)} Module
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium">Total Queries</p>
                        <p className="text-2xl font-bold">{formatNumber(moduleStats.totalQueries)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Success Rate</p>
                        <p className={`text-2xl font-bold ${getStatusColor(moduleStats.successRate)}`}>
                          {formatPercentage(moduleStats.successRate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Avg Response Time</p>
                        <p className="text-2xl font-bold">{formatDuration(moduleStats.averageResponseTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Learnt Entries</p>
                        <p className="text-2xl font-bold">{formatNumber(moduleStats.learntEntries)}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance</span>
                        <span>{formatPercentage(moduleStats.successRate)}</span>
                      </div>
                      <Progress value={moduleStats.successRate * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Engine Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.learning ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium">Total Patterns</p>
                    <p className="text-2xl font-bold">{stats.learning.totalPatterns}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Queue Size</p>
                    <p className="text-2xl font-bold">{stats.learning.queueSize}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pattern Types</p>
                    <p className="text-2xl font-bold">{stats.learning.patternTypes?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Avg Confidence</p>
                    <p className="text-2xl font-bold">{formatPercentage(stats.learning.averageConfidence || 0)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Learning engine not initialized</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cognitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cognitive Engine Status</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.cognitive ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={stats.cognitive.initialized ? "default" : "destructive"}>
                      {stats.cognitive.initialized ? "Initialized" : "Not Initialized"}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Registered Modules</p>
                    <div className="flex flex-wrap gap-2">
                      {stats.cognitive.registeredModules?.map((module: string) => (
                        <Badge key={module} variant="outline">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {stats.cognitive.contextStats && (
                    <div>
                      <p className="text-sm font-medium mb-2">Context Statistics</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Message Count</p>
                          <p className="text-lg font-semibold">{stats.cognitive.contextStats.messageCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Session Duration</p>
                          <p className="text-lg font-semibold">
                            {formatDuration(stats.cognitive.contextStats.duration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Cognitive engine not initialized</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
