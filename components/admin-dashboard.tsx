"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Clock,
  User,
} from "lucide-react"

interface AdminDashboardProps {
  onToggleChat: () => void
  messages: any[]
}

export function AdminDashboard({ onToggleChat, messages }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [systemStats, setSystemStats] = useState({
    totalQueries: 0,
    successRate: 0.95,
    averageResponseTime: 250,
    uptime: Date.now(),
    initialized: true,
  })

  useEffect(() => {
    // Calculate stats from messages
    const userMessages = messages.filter((m) => m.sender === "user")
    const aiMessages = messages.filter((m) => m.sender === "ai")
    const successfulResponses = aiMessages.filter((m) => m.confidence && m.confidence > 0.5)

    setSystemStats({
      totalQueries: userMessages.length,
      successRate: userMessages.length > 0 ? successfulResponses.length / userMessages.length : 1,
      averageResponseTime: 250,
      uptime: Date.now(),
      initialized: true,
    })
  }, [messages])

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "chat-log", label: "Chat Log", icon: MessageSquare },
    { id: "knowledge", label: "Knowledge Management", icon: Database },
    { id: "performance", label: "Performance Monitor", icon: TrendingUp },
    { id: "settings", label: "System Settings", icon: Cog },
  ]

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor((Date.now() - uptime) / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const handleExport = () => {
    const exportData = {
      messages,
      systemStats,
      timestamp: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `zacai-export-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
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
                <h2 className="font-bold text-lg text-gray-900">ZacAI v100</h2>
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
                    <SidebarMenuButton
                      onClick={() => window.location.reload()}
                      className="text-gray-700 hover:bg-gray-100"
                    >
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
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Online
              </Badge>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {systemStats.totalQueries} queries
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {Math.round(systemStats.averageResponseTime)}ms avg
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                Uptime: {formatUptime(systemStats.uptime)}
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
                          <div className="text-2xl font-bold text-blue-600">{systemStats.totalQueries}</div>
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
                            {Math.round(systemStats.successRate * 100)}%
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
                            {Math.round(systemStats.averageResponseTime)}ms
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
                          <div className="text-2xl font-bold text-orange-600">{formatUptime(systemStats.uptime)}</div>
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
                        <Badge variant="default">Yes</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>AI Engine Status</span>
                        <Badge variant="default">Operational</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Chat Messages</span>
                        <Badge variant="secondary">{messages.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "chat-log" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Chat Log</h2>
                  <p className="text-gray-600">View recent conversations and interactions.</p>
                </div>

                <Card className="bg-white">
                  <CardContent className="p-0">
                    <ScrollArea className="h-96">
                      {messages.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No chat entries yet</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {messages.map((message, index) => (
                            <div key={message.id || index} className="p-4">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    message.sender === "user"
                                      ? "bg-gray-300"
                                      : "bg-gradient-to-br from-blue-500 to-purple-600"
                                  }`}
                                >
                                  {message.sender === "user" ? (
                                    <User className="w-4 h-4 text-gray-600" />
                                  ) : (
                                    <Brain className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium capitalize">{message.sender}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(message.timestamp).toLocaleString()}
                                    </span>
                                    {message.confidence && (
                                      <Badge variant="secondary" className="text-xs">
                                        {Math.round(message.confidence * 100)}% confidence
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{message.content}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
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
                          <div className="text-2xl font-bold text-blue-600">432</div>
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
                          <div className="text-2xl font-bold text-green-600">156</div>
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
                          <div className="text-2xl font-bold text-purple-600">89</div>
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
                          <div className="text-2xl font-bold text-orange-600">234</div>
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Vocabulary Module</span>
                        <Badge variant="default">Loaded</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Mathematics Module</span>
                        <Badge variant="default">Loaded</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Facts Module</span>
                        <Badge variant="default">Loaded</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Coding Module</span>
                        <Badge variant="default">Loaded</Badge>
                      </div>
                    </div>
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
                      <div className="text-2xl font-bold">{Math.round(systemStats.averageResponseTime)}ms</div>
                      <p className="text-xs text-muted-foreground">Average response time</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-sm">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Math.round(systemStats.successRate * 100)}%</div>
                      <p className="text-xs text-muted-foreground">Query success rate</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-sm">Total Queries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{systemStats.totalQueries}</div>
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
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>System Version</span>
                        <Badge variant="secondary">v100</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Auto-save Chat Log</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Response Confidence Display</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                    </div>
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
