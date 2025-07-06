"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3,
  Database,
  Brain,
  TrendingUp,
  ArrowLeft,
  Settings,
  Download,
  Upload,
  Activity,
  Cpu,
  HardDrive,
  Shield,
  Clock,
} from "lucide-react"

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

interface SystemSettings {
  responseSpeed: number
  memoryRetention: number
  learningRate: number
  enableThinking: boolean
  autoSave: boolean
  debugMode: boolean
}

export default function AdminDashboard({ onToggleChat }: AdminDashboardProps) {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [settings, setSettings] = useState<SystemSettings>({
    responseSpeed: 5,
    memoryRetention: 30,
    learningRate: 0.5,
    enableThinking: true,
    autoSave: true,
    debugMode: false,
  })
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      // Mock system stats with more realistic data
      const systemStats: SystemStats = {
        initialized: true,
        modules: {
          vocabulary: { 
            status: "active", 
            loadTime: 120, 
            accuracy: 0.94,
            memoryUsage: "12.3MB",
            lastUpdate: "2 hours ago"
          },
          mathematics: { 
            status: "active", 
            loadTime: 95, 
            accuracy: 0.98,
            memoryUsage: "8.7MB",
            lastUpdate: "1 hour ago"
          },
          facts: { 
            status: "active", 
            loadTime: 200, 
            accuracy: 0.89,
            memoryUsage: "15.2MB",
            lastUpdate: "30 minutes ago"
          },
          coding: { 
            status: "active", 
            loadTime: 180, 
            accuracy: 0.92,
            memoryUsage: "18.9MB",
            lastUpdate: "45 minutes ago"
          },
          philosophy: { 
            status: "standby", 
            loadTime: 0, 
            accuracy: 0.85,
            memoryUsage: "0MB",
            lastUpdate: "Never"
          },
        },
        uptime: Date.now() - (Date.now() - 1800000), // 30 minutes ago
        totalQueries: 127,
        averageResponseTime: 1250,
        successRate: 0.96,
        chatLogEntries: 45,
        memoryStats: { used: "67.8MB", available: "932.2MB", total: "1GB" },
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

  const handleSettingsChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    console.log("Saving settings:", settings)
    // In a real app, this would save to backend
    alert("Settings saved successfully!")
  }

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `zacai-settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          setSettings(importedSettings)
          alert("Settings imported successfully!")
        } catch (error) {
          alert("Error importing settings. Please check the file format.")
        }
      }
      reader.readAsText(file)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-96 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading ZacAI Dashboard
            </h2>
            <p className="text-gray-600">Initializing system analytics...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onToggleChat} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Chat
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ZacAI Admin Dashboard</h1>
                <p className="text-gray-600">System management and monitoring • Version 208</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={`px-3 py-1 ${stats?.initialized ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${stats?.initialized ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                {stats?.initialized ? "Online" : "Offline"}
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
                <Activity className="w-3 h-3 mr-1" />
                {stats?.totalQueries || 0} queries
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1">
                <Clock className="w-3 h-3 mr-1" />
                {formatUptime(stats?.uptime || 0)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">Overview</TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-white">Statistics</TabsTrigger>
            <TabsTrigger value="knowledge" className="data-[state=active]:bg-white">Knowledge</TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-white">Modules</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Queries</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalQueries || 0}</p>
                      <p className="text-xs text-green-600 mt-1">↗ +12% from last hour</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-3xl font-bold text-gray-900">{Math.round((stats?.successRate || 0) * 100)}%</p>
                      <p className="text-xs text-green-600 mt-1">↗ +2% improvement</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Response</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.averageResponseTime || 0}ms</p>
                      <p className="text-xs text-orange-600 mt-1">↗ +50ms slower</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Modules</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {Object.values(stats?.modules || {}).filter((m: any) => m.status === "active").length}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">All systems operational</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Database className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-blue-600" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span className="font-medium">{stats?.memoryStats?.used} / {stats?.memoryStats?.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: "68%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span className="font-medium">23%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: "23%" }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Quality</span>
                      <span className="font-medium">96%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{ width: "96%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-600" />
                    Module Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-3">
                      {Object.entries(stats?.modules || {}).map(([name, module]: [string, any]) => (
                        <div key={name} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              module.status === "active" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                            }`} />
                            <div>
                              <p className="font-medium text-gray-900 capitalize">{name}</p>
                              <p className="text-xs text-gray-600">
                                {module.memoryUsage} • {Math.round(module.accuracy * 100)}% accuracy
                              </p>
                            </div>
                          </div>
                          <Badge variant={module.status === "active" ? "default" : "secondary"} className="text-xs">
                            {module.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Settings */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="response-speed" className="text-sm font-medium">
                      Response Speed: {settings.responseSpeed}/10
                    </Label>
                    <Slider
                      id="response-speed"
                      min={1}
                      max={10}
                      step={1}
                      value={[settings.responseSpeed]}
                      onValueChange={(value) => handleSettingsChange("responseSpeed", value[0])}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      Higher values increase response speed but may reduce accuracy
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="memory-retention" className="text-sm font-medium">
                      Memory Retention (days)
                    </Label>
                    <Input
                      id="memory-retention"
                      type="number"
                      min="1"
                      max="365"
                      value={settings.memoryRetention}
                      onChange={(e) => handleSettingsChange("memoryRetention", Number.parseInt(e.target.value))}
                      className="bg-white"
                    />
                    <p className="text-xs text-gray-500">How long to retain conversation history</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="learning-rate" className="text-sm font-medium">
                      Learning Rate: {settings.learningRate.toFixed(1)}
                    </Label>
                    <Slider
                      id="learning-rate"
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={[settings.learningRate]}
                      onValueChange={(value) => handleSettingsChange("learningRate", value[0])}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">Rate at which the system adapts to new information</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enable-thinking" className="text-sm font-medium">Enable Thinking Process</Label>
                        <p className="text-xs text-gray-500">Show AI reasoning steps to users</p>
                      </div>
                      <Switch
                        id="enable-thinking"
                        checked={settings.enableThinking}
                        onCheckedChange={(checked) => handleSettingsChange("enableThinking", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-save" className="text-sm font-medium">Auto Save</Label>
                        <p className="text-xs text-gray-500">Automatically save conversations and settings</p>
                      </div>
                      <Switch
                        id="auto-save"
                        checked={settings.autoSave}
                        onCheckedChange={(checked) => handleSettingsChange("autoSave", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="debug-mode" className="text-sm font-medium">Debug Mode</Label>
                        <p className="text-xs text-gray-500">Enable detailed logging and diagnostics</p>
                      </div>
                      <Switch
                        id="debug-mode"
                        checked={settings.debugMode}
                        onCheckedChange={(checked) => handleSettingsChange("debugMode", checked)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button onClick={handleSaveSettings} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <Shield className="w-4 h-4 mr-2" />
                      Save Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Import/Export */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-green-600" />
                    Backup & Restore
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Export Current Settings</Label>
                    <p className="text-sm text-gray-600 mb-3">Download your current configuration as a JSON file</p>
                    <Button onClick={handleExportSettings} variant="outline" className="w-full bg-white hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Import Settings</Label>
                    <p className="text-sm text-gray-600 mb-3">Upload a settings JSON file to restore configuration</p>
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".json"
                        onChange={handleImportSettings}
                        className="hidden"
                        id="import-settings"
                      />
                      <Button asChild variant="outline" className="w-full bg-white hover:bg-gray-50">
                        <label htmlFor="import-settings" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Import Settings
                        </label>
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium">Current Configuration Preview</Label>
                    <ScrollArea className="h-48 mt-2">
                      <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono">
                        <pre className="whitespace-pre-wrap text-gray-700">
                          {JSON.stringify(settings, null, 2)}
                        </pre>
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Placeholder tabs */}
          <TabsContent value="stats">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Detailed Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Advanced statistics and analytics dashboard will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>\
