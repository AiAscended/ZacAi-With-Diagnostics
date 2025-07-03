"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Activity,
  Database,
  Brain,
  BookOpen,
  Calculator,
  Globe,
  Code,
  Lightbulb,
  MessageCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  Home,
  PieChart,
  FileText,
  Cog,
  User,
  History,
  Trash2,
} from "lucide-react"
import { systemManager } from "@/core/system/manager"
import { userMemory } from "@/core/memory/user-memory"

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

export default function AdminDashboardClean({ onToggleChat }: AdminDashboardProps) {
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

  const handleClearMemory = () => {
    if (confirm("Are you sure you want to clear user memory? This cannot be undone.")) {
      userMemory.clear()
      loadStats()
    }
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "modules", label: "Modules", icon: Database },
    { id: "chat-log", label: "Chat Log", icon: History },
    { id: "memory", label: "User Memory", icon: User },
    { id: "analytics", label: "Analytics", icon: PieChart },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Cog },
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
        {/* Clean Sidebar */}
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
                      <MessageCircle className="w-4 h-4 mr-3" />
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
          {/* Clean Header */}
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

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-white border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Queries</p>
                          <p className="text-2xl font-bold text-gray-900">{stats?.totalQueries || 0}</p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Success Rate</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.round((stats?.successRate || 0) * 100)}%
                          </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Avg Response</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.round(stats?.averageResponseTime || 0)}ms
                          </p>
                        </div>
                        <Clock className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Modules</p>
                          <p className="text-2xl font-bold text-gray-900">{Object.keys(stats?.modules || {}).length}</p>
                        </div>
                        <Database className="w-8 h-8 text-cyan-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Module Status */}
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Database className="w-5 h-5" />
                      Module Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(stats?.modules || {}).map(([name, moduleStats]) => (
                        <div key={name} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium capitalize flex items-center gap-2 text-gray-900">
                              {name === "vocabulary" && <BookOpen className="w-4 h-4 text-blue-600" />}
                              {name === "mathematics" && <Calculator className="w-4 h-4 text-green-600" />}
                              {name === "facts" && <Globe className="w-4 h-4 text-purple-600" />}
                              {name === "coding" && <Code className="w-4 h-4 text-cyan-600" />}
                              {name === "philosophy" && <Lightbulb className="w-4 h-4 text-orange-600" />}
                              {name === "user-info" && <User className="w-4 h-4 text-red-600" />}
                              {name}
                            </h3>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Queries:</span>
                              <span className="font-mono">{(moduleStats as any)?.totalQueries || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Success Rate:</span>
                              <span className="font-mono">
                                {Math.round(((moduleStats as any)?.successRate || 0) * 100)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Learnt Entries:</span>
                              <span className="font-mono">{(moduleStats as any)?.learntEntries || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "chat-log" && (
              <div className="space-y-6">
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <History className="w-5 h-5" />
                        Chat Log ({chatLog.length} entries)
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearChatLog}
                        className="text-red-600 hover:text-red-700 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Log
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {chatLog.map((entry) => (
                          <div key={entry.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {new Date(entry.timestamp).toLocaleString()}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  {Math.round(entry.confidence * 100)}% confidence
                                </Badge>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                  {entry.processingTime}ms
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-medium text-gray-700">User:</p>
                                <p className="text-sm text-gray-900 bg-white p-2 rounded border">{entry.input}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">ZacAI:</p>
                                <p className="text-sm text-gray-900 bg-white p-2 rounded border">{entry.response}</p>
                              </div>
                              {entry.sources.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Sources:</span>
                                  {entry.sources.map((source: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {source}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {chatLog.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No chat history available</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "memory" && (
              <div className="space-y-6">
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <User className="w-5 h-5" />
                        User Memory System
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearMemory}
                        className="text-red-600 hover:text-red-700 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Memory
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      {(() => {
                        const memoryStats = stats?.memoryStats || {}
                        return (
                          <>
                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="text-2xl font-bold text-blue-600">{memoryStats.totalEntries || 0}</div>
                              <div className="text-sm text-gray-600">Total Memories</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="text-2xl font-bold text-green-600">
                                {memoryStats.personalEntries || 0}
                              </div>
                              <div className="text-sm text-gray-600">Personal Info</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="text-2xl font-bold text-purple-600">
                                {memoryStats.conversationCount || 0}
                              </div>
                              <div className="text-sm text-gray-600">Conversations</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="text-2xl font-bold text-orange-600">
                                {memoryStats.preferenceEntries || 0}
                              </div>
                              <div className="text-sm text-gray-600">Preferences</div>
                            </div>
                          </>
                        )
                      })()}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Personal Summary</h3>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <pre className="text-sm whitespace-pre-wrap text-gray-900">
                          {userMemory.getPersonalSummary()}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {!["overview", "chat-log", "memory"].includes(activeTab) && (
              <Card className="bg-white border-gray-200">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    {sidebarItems.find((item) => item.id === activeTab)?.label} Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    This section is under development and will be available in the next update.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
