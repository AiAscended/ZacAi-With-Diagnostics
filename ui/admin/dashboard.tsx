"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Database, Brain, TrendingUp, ArrowLeft } from "lucide-react"

// Import sub-components with fallbacks
let StatsPanel: any = null
let KnowledgeBrowser: any = null
let ModuleManager: any = null
let DiagnosticsPanel: any = null

try {
  StatsPanel = require("./stats-panel").default
} catch {
  console.warn("StatsPanel component not found, using fallback")
}

try {
  KnowledgeBrowser = require("./knowledge-browser").default
} catch {
  console.warn("KnowledgeBrowser component not found, using fallback")
}

try {
  ModuleManager = require("./module-manager").default
} catch {
  console.warn("ModuleManager component not found, using fallback")
}

try {
  DiagnosticsPanel = require("./diagnostics-panel").default
} catch {
  console.warn("DiagnosticsPanel component not found, using fallback")
}

interface AdminDashboardProps {
  onToggleChat: () => void
}

interface SystemStats {
  initialized: boolean
  modules: { [key: string]: any }
  uptime: number
  totalQueries: number
  averageResponseTime: number
  successRate: number
  chatLogEntries: number
  memoryStats: any
}

export default function AdminDashboard({ onToggleChat }: AdminDashboardProps) {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      // Mock system stats
      const systemStats: SystemStats = {
        initialized: true,
        modules: {
          vocabulary: { status: "active", loadTime: 120 },
          mathematics: { status: "active", loadTime: 95 },
          facts: { status: "active", loadTime: 200 },
          coding: { status: "active", loadTime: 180 },
          philosophy: { status: "standby", loadTime: 0 },
        },
        uptime: Date.now() - (Date.now() - 300000), // 5 minutes ago
        totalQueries: 42,
        averageResponseTime: 150,
        successRate: 0.95,
        chatLogEntries: 15,
        memoryStats: { used: "45MB", available: "955MB" },
      }
      setStats(systemStats)
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to load stats:", error)
      setIsLoading(false)
    }
  }

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 animate-pulse text-blue-600" />
            <h2 className="text-xl font-bold mb-2">Loading ZacAI Dashboard</h2>
            <p className="text-gray-600">Initializing system analytics...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onToggleChat}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chat
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ZacAI Admin Dashboard</h1>
                <p className="text-gray-600">System management and monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${stats?.initialized ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
              >
                {stats?.initialized ? "Online" : "Offline"}
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {stats?.totalQueries || 0} queries
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                Uptime: {formatUptime(stats?.uptime || 0)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Queries</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalQueries || 0}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round((stats?.successRate || 0) * 100)}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Response</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.averageResponseTime || 0}ms</p>
                    </div>
                    <Brain className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Modules</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Object.values(stats?.modules || {}).filter((m: any) => m.status === "active").length}
                      </p>
                    </div>
                    <Database className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Module Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats?.modules || {}).map(([name, module]: [string, any]) => (
                    <div key={name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{name}</p>
                          <p className="text-sm text-gray-600">Load time: {module.loadTime}ms</p>
                        </div>
                      </div>
                      <Badge variant={module.status === "active" ? "default" : "secondary"}>{module.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {StatsPanel ? (
              <StatsPanel stats={stats} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Statistics Panel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Statistics panel loading...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            {KnowledgeBrowser ? (
              <KnowledgeBrowser />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Browser</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Knowledge browser loading...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            {ModuleManager ? (
              <ModuleManager modules={stats?.modules} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Module Manager</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Module manager loading...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="diagnostics" className="space-y-6">
            {DiagnosticsPanel ? (
              <DiagnosticsPanel stats={stats} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>System Diagnostics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Diagnostics panel loading...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
