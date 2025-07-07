"use client"
import { useState, useEffect } from "react"
import { systemManager } from "@/core/system/manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { MessageSquare, Activity, Settings, BarChart3, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface AdminDashboardProps {
  onToggleChat: () => void
}

export function AdminDashboard({ onToggleChat }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const systemStats = systemManager.getSystemStats()
      setStats(systemStats)
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to load stats:", error)
      setIsLoading(false)
    }
  }

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ZacAI Admin Dashboard</h1>
              <p className="text-sm text-gray-600">System Management & Analytics</p>
            </div>
          </div>

          <Button onClick={onToggleChat} variant="outline" className="btn-hover-effect bg-transparent">
            <MessageSquare className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-lg font-semibold text-green-600">Online</span>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Queries</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQueries || 0}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round((stats.successRate || 0) * 100)}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{formatUptime(stats.uptime || 0)}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="engines">Engines</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          {/* Modules Tab */}
          <TabsContent value="modules">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stats.modules &&
                Object.entries(stats.modules).map(([name, moduleStats]: [string, any]) => (
                  <Card key={name} className="card-hover">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="capitalize">{name} Module</span>
                        <Badge variant="secondary">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Queries</p>
                          <p className="font-semibold">{moduleStats.totalQueries || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Success Rate</p>
                          <p className="font-semibold">{Math.round((moduleStats.successRate || 0) * 100)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg Response</p>
                          <p className="font-semibold">{Math.round(moduleStats.averageResponseTime || 0)}ms</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Learnt Entries</p>
                          <p className="font-semibold">{moduleStats.learntEntries || 0}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Performance</span>
                          <span>{Math.round((moduleStats.successRate || 0) * 100)}%</span>
                        </div>
                        <Progress value={(moduleStats.successRate || 0) * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Engines Tab */}
          <TabsContent value="engines">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {stats.engines &&
                Object.entries(stats.engines).map(([name, engineStats]: [string, any]) => (
                  <Card key={name} className="card-hover">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="capitalize">{name} Engine</span>
                        <Badge variant={engineStats.initialized ? "default" : "secondary"}>
                          {engineStats.initialized ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ready
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Offline
                            </>
                          )}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <span className={engineStats.initialized ? "text-green-600" : "text-red-600"}>
                            {engineStats.initialized ? "Operational" : "Offline"}
                          </span>
                        </div>
                        {engineStats.registeredModules && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Modules</span>
                            <span>{engineStats.registeredModules.length || 0}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Response Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Response Time</span>
                      <Badge variant="outline">{stats.averageResponseTime || 0}ms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Processed</span>
                      <Badge variant="outline">{stats.totalQueries || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Chat Log Entries</span>
                      <Badge variant="outline">{stats.chatLogEntries || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">System Initialized</span>
                      {stats.initialized ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Modules</span>
                      <Badge variant="outline">{stats.modules ? Object.keys(stats.modules).length : 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Engines</span>
                      <Badge variant="outline">{stats.engines ? Object.keys(stats.engines).length : 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="logs">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.errors && stats.errors.length > 0 ? (
                    stats.errors.map((error: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-700">{error}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-green-700">No errors reported - system running smoothly</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
