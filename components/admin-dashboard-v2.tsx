"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageSquare,
  Settings,
  Activity,
  Database,
  Brain,
  Users,
  BarChart3,
  Shield,
  Zap,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"

interface AdminDashboardProps {
  onToggleChat: () => void
}

export default function AdminDashboardV2({ onToggleChat }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const systemStats = {
    totalUsers: 1,
    activeChats: 1,
    systemUptime: "99.9%",
    responseTime: "150ms",
    memoryUsage: "45MB",
    modulesLoaded: 8,
  }

  const recentActivity = [
    { id: 1, action: "System initialized", time: "2 minutes ago", status: "success" },
    { id: 2, action: "User session started", time: "3 minutes ago", status: "info" },
    { id: 3, action: "Admin dashboard accessed", time: "5 minutes ago", status: "info" },
    { id: 4, action: "Memory optimization completed", time: "10 minutes ago", status: "success" },
  ]

  const modules = [
    { name: "Vocabulary", status: "active", loadTime: "120ms", usage: "High" },
    { name: "Mathematics", status: "active", loadTime: "95ms", usage: "Medium" },
    { name: "Facts", status: "active", loadTime: "200ms", usage: "Low" },
    { name: "Coding", status: "active", loadTime: "180ms", usage: "Medium" },
    { name: "Philosophy", status: "standby", loadTime: "0ms", usage: "None" },
    { name: "User Memory", status: "active", loadTime: "50ms", usage: "High" },
    { name: "Storage Manager", status: "active", loadTime: "30ms", usage: "High" },
    { name: "Safe Mode", status: "active", loadTime: "25ms", usage: "Critical" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getModuleStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "standby":
        return <Badge variant="secondary">Standby</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Badge className="bg-green-100 text-green-800">System Online</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Chats</p>
                      <p className="text-2xl font-bold text-gray-900">{systemStats.activeChats}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">System Uptime</p>
                      <p className="text-2xl font-bold text-gray-900">{systemStats.systemUptime}</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Response Time</p>
                      <p className="text-2xl font-bold text-gray-900">{systemStats.responseTime}</p>
                    </div>
                    <Zap className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {getStatusIcon(activity.status)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-gray-600">{systemStats.memoryUsage}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm text-gray-600">{systemStats.responseTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Modules Loaded</span>
                      <span className="text-sm text-gray-600">{systemStats.modulesLoaded}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">All systems operational</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Memory usage normal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Response times optimal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Module Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{module.name}</p>
                          <p className="text-sm text-gray-600">Load time: {module.loadTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Usage: {module.usage}</span>
                        {getModuleStatusBadge(module.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">User management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">System settings panel coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScrollArea className="h-5 w-5" />
                  System Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full border rounded p-4 bg-gray-50">
                  <div className="space-y-2 font-mono text-xs">
                    <div className="text-green-600">[INFO] System initialized successfully</div>
                    <div className="text-blue-600">[INFO] User session started</div>
                    <div className="text-green-600">[INFO] All modules loaded</div>
                    <div className="text-blue-600">[INFO] Admin dashboard accessed</div>
                    <div className="text-green-600">[INFO] Memory optimization completed</div>
                    <div className="text-gray-600">[DEBUG] Performance monitoring active</div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
