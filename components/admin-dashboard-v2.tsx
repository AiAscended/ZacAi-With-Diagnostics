"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  Activity,
  Database,
  Brain,
  BookOpen,
  Calculator,
  Globe,
  Code,
  Lightbulb,
  MessageCircle,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  Home,
  PieChart,
  FileText,
  Cog,
  User,
} from "lucide-react"
import { systemManager } from "@/core/system/manager"
import { userMemory } from "@/core/memory/user-memory"

interface AdminDashboardProps {
  onToggleChat: () => void
}

interface SystemStats {
  initialized: boolean
  modules: { [key: string]: any }
  learning: any
  cognitive: any
  uptime: number
  totalQueries: number
  averageResponseTime: number
}

export default function AdminDashboardV2({ onToggleChat }: AdminDashboardProps) {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 5000)
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

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "modules", label: "Modules", icon: Database },
    { id: "analytics", label: "Analytics", icon: PieChart },
    { id: "memory", label: "User Memory", icon: User },
    { id: "learning", label: "Learning", icon: Brain },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Cog },
  ]

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
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">ZacAI</h2>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTab === item.id}
                        className="w-full justify-start"
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
              <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={onToggleChat}>
                      <MessageCircle className="w-4 h-4 mr-3" />
                      Back to Chat
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleExport}>
                      <Download className="w-4 h-4 mr-3" />
                      Export Data
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={loadStats}>
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
              <h1 className="text-xl font-semibold">
                {sidebarItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
              </h1>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {stats?.initialized ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary">{stats?.totalQueries || 0} queries</Badge>
              <Badge variant="secondary">{Math.round(stats?.averageResponseTime || 0)}ms avg</Badge>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Quick Stats - CLEAN WHITE DESIGN */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card
                    className="bg-white hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setActiveTab("modules")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Queries</p>
                          <p className="text-2xl font-bold text-blue-600">{stats?.totalQueries || 0}</p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-white hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setActiveTab("performance")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Avg Response</p>
                          <p className="text-2xl font-bold text-green-600">
                            {Math.round(stats?.averageResponseTime || 0)}ms
                          </p>
                        </div>
                        <Clock className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-white hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setActiveTab("modules")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Modules</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {Object.keys(stats?.modules || {}).length}
                          </p>
                        </div>
                        <Database className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-white hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setActiveTab("memory")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">System Health</p>
                          <p className="text-2xl font-bold text-emerald-600">98%</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Module Status */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Module Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(stats?.modules || {}).map(([name, moduleStats]) => (
                        <Card key={name} className="bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium capitalize flex items-center gap-2">
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
                                <span className="font-medium">{(moduleStats as any)?.totalQueries || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Success Rate:</span>
                                <span className="font-medium">
                                  {Math.round(((moduleStats as any)?.successRate || 0) * 100)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Learnt Entries:</span>
                                <span className="font-medium">{(moduleStats as any)?.learntEntries || 0}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "modules" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(stats?.modules || {}).map(([name, moduleStats]) => (
                    <Card key={name} className="bg-white">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 capitalize">
                          {name === "vocabulary" && <BookOpen className="w-5 h-5 text-blue-600" />}
                          {name === "mathematics" && <Calculator className="w-5 h-5 text-green-600" />}
                          {name === "facts" && <Globe className="w-5 h-5 text-purple-600" />}
                          {name === "coding" && <Code className="w-5 h-5 text-cyan-600" />}
                          {name === "philosophy" && <Lightbulb className="w-5 h-5 text-orange-600" />}
                          {name === "user-info" && <User className="w-5 h-5 text-red-600" />}
                          {name} Module
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {(moduleStats as any)?.totalQueries || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total Queries</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {Math.round(((moduleStats as any)?.successRate || 0) * 100)}%
                            </div>
                            <div className="text-sm text-gray-600">Success Rate</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Learnt Entries:</span>
                            <span className="font-mono">{(moduleStats as any)?.learntEntries || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Avg Response Time:</span>
                            <span className="font-mono">
                              {Math.round((moduleStats as any)?.averageResponseTime || 0)}ms
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Last Update:</span>
                            <span className="font-mono">
                              {(moduleStats as any)?.lastUpdate
                                ? new Date((moduleStats as any).lastUpdate).toLocaleTimeString()
                                : "Never"}
                            </span>
                          </div>
                        </div>

                        <Progress value={Math.round(((moduleStats as any)?.successRate || 0) * 100)} className="h-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "memory" && (
              <div className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      User Memory System
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {(() => {
                        const memoryStats = userMemory.getStats()
                        return (
                          <>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">{memoryStats.totalEntries}</div>
                              <div className="text-sm text-gray-600">Total Memories</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">{memoryStats.personalEntries}</div>
                              <div className="text-sm text-gray-600">Personal Info</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">{memoryStats.conversationCount}</div>
                              <div className="text-sm text-gray-600">Conversations</div>
                            </div>
                          </>
                        )
                      })()}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Personal Summary</h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap">{userMemory.getPersonalSummary()}</pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      System Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Debug Mode</Label>
                          <p className="text-sm text-gray-500">Enable detailed logging</p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto Learning</Label>
                          <p className="text-sm text-gray-500">Automatically learn from interactions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Performance Monitoring</Label>
                          <p className="text-sm text-gray-500">Track system performance metrics</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-medium">Cache Settings</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cache-size">Cache Size (MB)</Label>
                          <Input id="cache-size" type="number" defaultValue="100" />
                        </div>
                        <div>
                          <Label htmlFor="cache-ttl">Cache TTL (minutes)</Label>
                          <Input id="cache-ttl" type="number" defaultValue="60" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-4">
                      <Button variant="outline">Reset Settings</Button>
                      <Button>Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {!["overview", "modules", "memory", "settings"].includes(activeTab) && (
              <Card className="bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
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
