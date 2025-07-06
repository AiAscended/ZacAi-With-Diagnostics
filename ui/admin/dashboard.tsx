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
import { BarChart3, Database, Brain, TrendingUp, ArrowLeft, Settings, Download, Upload } from "lucide-react"

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
      // Mock system stats
      const systemStats: SystemStats = {
        initialized: true,
        modules: {
          vocabulary: { status: "active", loadTime: 120, accuracy: 0.94 },
          mathematics: { status: "active", loadTime: 95, accuracy: 0.98 },
          facts: { status: "active", loadTime: 200, accuracy: 0.89 },
          coding: { status: "active", loadTime: 180, accuracy: 0.92 },
          philosophy: { status: "standby", loadTime: 0, accuracy: 0.85 },
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

  const handleSettingsChange = (key: keyof SystemSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    console.log("Saving settings:", settings)
    alert("Settings saved successfully!")
  }

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "zacai-settings.json"
    link.click()
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
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
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm">
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

              <Card className="bg-white/90 backdrop-blur-sm">
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

              <Card className="bg-white/90 backdrop-blur-sm">
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

              <Card className="bg-white/90 backdrop-blur-sm">
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

            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Module Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats?.modules || {}).map(([name, module]: [string, any]) => (
                    <div key={name} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{name}</p>
                          <p className="text-sm text-gray-600">
                            Load time: {module.loadTime}ms | Accuracy: {Math.round(module.accuracy * 100)}%
                          </p>
                        </div>
                      </div>
                      <Badge variant={module.status === "active" ? "default" : "secondary"}>{module.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="response-speed">Response Speed: {settings.responseSpeed}</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="memory-retention">Memory Retention (days): {settings.memoryRetention}</Label>
                    <Input
                      id="memory-retention"
                      type="number"
                      min="1"
                      max="365"
                      value={settings.memoryRetention}
                      onChange={(e) => handleSettingsChange("memoryRetention", Number.parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">How long to retain conversation history</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learning-rate">Learning Rate: {settings.learningRate}</Label>
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

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enable-thinking">Enable Thinking Process</Label>
                        <p className="text-xs text-gray-500">Show AI reasoning steps</p>
                      </div>
                      <Switch
                        id="enable-thinking"
                        checked={settings.enableThinking}
                        onCheckedChange={(checked) => handleSettingsChange("enableThinking", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-save">Auto Save</Label>
                        <p className="text-xs text-gray-500">Automatically save conversations</p>
                      </div>
                      <Switch
                        id="auto-save"
                        checked={settings.autoSave}
                        onCheckedChange={(checked) => handleSettingsChange("autoSave", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="debug-mode">Debug Mode</Label>
                        <p className="text-xs text-gray-500">Enable detailed logging</p>
                      </div>
                      <Switch
                        id="debug-mode"
                        checked={settings.debugMode}
                        onCheckedChange={(checked) => handleSettingsChange("debugMode", checked)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button onClick={handleSaveSettings} className="w-full">
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Import/Export Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Export Current Settings</Label>
                    <p className="text-sm text-gray-600 mb-3">Download your current settings as a JSON file</p>
                    <Button onClick={handleExportSettings} variant="outline" className="w-full bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                  </div>

                  <div>
                    <Label>Import Settings</Label>
                    <p className="text-sm text-gray-600 mb-3">Upload a settings JSON file to restore configuration</p>
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".json"
                        onChange={handleImportSettings}
                        className="hidden"
                        id="import-settings"
                      />
                      <Button asChild variant="outline" className="w-full bg-transparent">
                        <label htmlFor="import-settings" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Import Settings
                        </label>
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Current Configuration</h4>
                    <div className="bg-gray-50 rounded p-3 text-xs">
                      <pre>{JSON.stringify(settings, null, 2)}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs would go here - keeping them simple for now */}
          <TabsContent value="stats">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Detailed Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Advanced statistics and analytics will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Knowledge Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Knowledge base management tools will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Module Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Module configuration and management interface will be here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
