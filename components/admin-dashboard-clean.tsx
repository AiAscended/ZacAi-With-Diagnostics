"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import {
  BarChart3,
  Download,
  RefreshCw,
  Database,
  Brain,
  BookOpen,
  Calculator,
  Globe,
  Code,
  TrendingUp,
  Home,
  Cog,
  MessageSquare,
} from "lucide-react"
import { systemManager } from "@/core/system/manager"

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
}

export function AdminDashboardClean({ onToggleChat }: AdminDashboardProps) {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [chatLog, setChatLog] = useState<any[]>([])

  useEffect(() => {
    loadStats()
    loadChatLog()
    const interval = setInterval(() => {
      loadStats()
      if (activeTab === "chat-log") {
        loadChatLog()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [activeTab])

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

  const loadChatLog = () => {
    try {
      const log = systemManager.getChatLog()
      setChatLog(log)
    } catch (error) {
      console.error("Failed to load chat log:", error)
    }
  }

  const handleExport = async () => {
    try {
      const exportData = await systemManager.exportData()
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `zacai-export-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const handleClearChatLog = () => {
    if (confirm("Are you sure you want to clear the chat log? This cannot be undone.")) {
      systemManager.clearChatLog()
      setChatLog([])
    }
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "chat-log", label: "Chat Log", icon: MessageSquare },
    { id: "knowledge", label: "Knowledge Management", icon: Database },
    { id: "performance", label: "Performance Monitor", icon: TrendingUp },
    { id: "settings", label: "System Settings", icon: Cog },
  ]

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
            <Progress value={75} className="mt-4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar className="border-r bg-white">
          <SidebarHeader className="p-4 border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">ZacAI</h2>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="bg-white">
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-600">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTab === item.id}
                        className="w-full justify-start text-gray-700 hover:bg-gray-100 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700"
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-600">Quick Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={onToggleChat} className="text-gray-700 hover:bg-gray-100">
                      <MessageSquare className="w-4 h-4 mr-3" />
                      Back to Chat
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleExport} className="text-gray-700 hover:bg-gray-100">
                      <Download className="w-4 h-4 mr-3" />
                      Export Data
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={loadStats} className="text-gray-700 hover:bg-gray-100">
                      <RefreshCw className="w-4 h-4 mr-3" />
                      Refresh
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">
                {sidebarItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
              </h1>
              <Badge
                variant="outline"
                className={`${stats?.initialized ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
              >
                {stats?.initialized ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {stats?.totalQueries || 0} queries
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {Math.round(stats?.averageResponseTime || 0)}ms avg
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                Uptime: {formatUptime(stats?.uptime || 0)}
              </Badge>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-4">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">System Overview</h2>
                  <p className="text-gray-600">Monitor and manage the AI system's key components.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{stats?.totalQueries || 0}</div>
                          <div className="text-sm text-muted-foreground">Total Queries</div>
                        </div>
                        <MessageSquare className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round((stats?.successRate || 0) * 100)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Success Rate</div>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(stats?.averageResponseTime || 0)}ms
                          </div>
                          <div className="text-sm text-muted-foreground">Avg Response Time</div>
                        </div>
                        <Brain className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-orange-600">{formatUptime(stats?.uptime || 0)}</div>
                          <div className="text-sm text-muted-foreground">System Uptime</div>
                        </div>
                        <Cog className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>System Initialized</span>
                        <Badge variant={stats?.initialized ? "default" : "destructive"}>
                          {stats?.initialized ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Chat Log Entries</span>
                        <Badge variant="secondary">{stats?.chatLogEntries || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "chat-log" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Chat Log</h2>
                    <p className="text-gray-600">View recent conversations and interactions.</p>
                  </div>
                  <Button onClick={handleClearChatLog} variant="destructive" size="sm">
                    Clear Log
                  </Button>
                </div>

                <Card className="bg-white">
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                      {chatLog.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No chat entries yet</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {chatLog
                            .slice(-20)
                            .reverse()
                            .map((entry, index) => (
                              <div key={entry.id || index} className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="text-sm font-medium">Query: {entry.input}</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(entry.timestamp).toLocaleString()}
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  Response: {entry.response.substring(0, 100)}...
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {Math.round(entry.confidence * 100)}% confidence
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {entry.processingTime}ms
                                  </Badge>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "knowledge" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Knowledge Management</h2>
                  <p className="text-gray-600">Manage the AI's knowledge base and learning data.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">0</div>
                          <div className="text-sm text-muted-foreground">Vocabulary Words</div>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600">0</div>
                          <div className="text-sm text-muted-foreground">Facts & Knowledge</div>
                        </div>
                        <Globe className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">0</div>
                          <div className="text-sm text-muted-foreground">Coding Knowledge</div>
                        </div>
                        <Code className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-orange-600">0</div>
                          <div className="text-sm text-muted-foreground">Math Concepts</div>
                        </div>
                        <Calculator className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Knowledge Base Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Knowledge modules are being loaded...</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "performance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Performance Monitor</h2>
                  <p className="text-gray-600">Monitor system performance and resource usage.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-sm">Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Math.round(stats?.averageResponseTime || 0)}ms</div>
                      <p className="text-xs text-muted-foreground">Average response time</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-sm">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Math.round((stats?.successRate || 0) * 100)}%</div>
                      <p className="text-xs text-muted-foreground">Query success rate</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-sm">Total Queries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalQueries || 0}</div>
                      <p className="text-xs text-muted-foreground">Queries processed</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">System Settings</h2>
                  <p className="text-gray-600">Configure system behavior and preferences.</p>
                </div>

                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Settings panel coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default AdminDashboardClean
