"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
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
  MessageSquare,
  Code,
  Lightbulb,
  User,
  ArrowLeft,
} from "lucide-react"
import { systemManager } from "@/core/system/manager"
import { formatNumber, formatPercentage, formatDuration } from "@/utils/formatters"

interface AdminDashboardProps {
  onToggleChat?: () => void
}

export default function AdminDashboard({ onToggleChat }: AdminDashboardProps) {
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
      <Card className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <CardContent>
          <div className="text-center">
            <Activity className="w-8 h-8 animate-pulse mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Loading System Analytics</h3>
            <p className="text-gray-600">Gathering performance metrics...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getModuleIcon = (moduleName: string) => {
    const icons: { [key: string]: any } = {
      vocabulary: BookOpen,
      mathematics: Calculator,
      facts: Globe,
      coding: Code,
      philosophy: Lightbulb,
      "user-info": User,
    }
    return icons[moduleName] || Database
  }

  const getStatusColor = (successRate: number) => {
    if (successRate >= 0.9) return "text-green-600"
    if (successRate >= 0.7) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusBadge = (successRate: number) => {
    if (successRate >= 0.9) return "default"
    if (successRate >= 0.7) return "secondary"
    return "destructive"
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onToggleChat && (
                <Button variant="ghost" size="sm" onClick={onToggleChat} className="text-gray-500 hover:text-gray-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Chat
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ZacAI Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">System performance and analytics</p>
              </div>
            </div>
            <Badge variant={stats.initialized ? "default" : "destructive"} className="px-3 py-1">
              {stats.initialized ? "System Online" : "System Offline"}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Modules</CardTitle>
                <Brain className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{Object.keys(stats.modules).length}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {Object.values(stats.modules).filter((m: any) => m.successRate > 0.5).length} performing well
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Queries</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(Object.values(stats.modules).reduce((sum: number, m: any) => sum + m.totalQueries, 0))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Across all modules</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPercentage(
                    Object.values(stats.modules).reduce((sum: number, m: any) => sum + m.successRate, 0) /
                      Object.keys(stats.modules).length,
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Average across modules</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatDuration(
                    Object.values(stats.modules).reduce((sum: number, m: any) => sum + m.averageResponseTime, 0) /
                      Object.keys(stats.modules).length,
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">System-wide average</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Tabs defaultValue="modules" className="space-y-4">
            <TabsList className="bg-white border shadow-sm">
              <TabsTrigger value="modules" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Modules
              </TabsTrigger>
              <TabsTrigger value="learning" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Learning
              </TabsTrigger>
              <TabsTrigger value="cognitive" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Cognitive Engine
              </TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="space-y-4">
              <div className="grid gap-4">
                {Object.entries(stats.modules).map(([name, moduleStats]: [string, any]) => {
                  const Icon = getModuleIcon(name)
                  return (
                    <Card key={name} className="bg-white shadow-sm border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <Icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <span className="text-lg font-semibold">
                                {name.charAt(0).toUpperCase() + name.slice(1)} Module
                              </span>
                              <div className="text-sm text-gray-500 font-normal">Knowledge processing and learning</div>
                            </div>
                          </div>
                          <Badge variant={getStatusBadge(moduleStats.successRate)}>
                            {formatPercentage(moduleStats.successRate)} success
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Queries</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(moduleStats.totalQueries)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 mb-1">Success Rate</p>
                            <p className={`text-2xl font-bold ${getStatusColor(moduleStats.successRate)}`}>
                              {formatPercentage(moduleStats.successRate)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 mb-1">Response Time</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {formatDuration(moduleStats.averageResponseTime)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 mb-1">Learnt Entries</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {formatNumber(moduleStats.learntEntries)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Performance Score</span>
                            <span className="font-medium">{formatPercentage(moduleStats.successRate)}</span>
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
              <Card className="bg-white shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    Learning Engine Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.learning ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Patterns</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.learning.totalPatterns}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-1">Queue Size</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.learning.queueSize}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-1">Pattern Types</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.learning.patternTypes?.length || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-1">Avg Confidence</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPercentage(stats.learning.averageConfidence || 0)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Learning engine not initialized</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cognitive" className="space-y-4">
              <Card className="bg-white shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Settings className="w-5 h-5 text-indigo-600" />
                    </div>
                    Cognitive Engine Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.cognitive ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Badge variant={stats.cognitive.initialized ? "default" : "destructive"} className="px-3 py-1">
                          {stats.cognitive.initialized ? "Initialized" : "Not Initialized"}
                        </Badge>
                        <span className="text-sm text-gray-600">Engine status and module registration</span>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-3">Registered Modules</p>
                        <div className="flex flex-wrap gap-2">
                          {stats.cognitive.registeredModules?.map((module: string) => (
                            <Badge key={module} variant="outline" className="px-3 py-1">
                              {module}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {stats.cognitive.contextStats && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-3">Context Statistics</p>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <MessageSquare className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">Message Count</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {stats.cognitive.contextStats.messageCount}
                              </p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">Session Duration</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {formatDuration(stats.cognitive.contextStats.duration)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Cognitive engine not initialized</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
