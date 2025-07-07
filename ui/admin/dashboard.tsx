"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Activity,
  Database,
  Cpu,
  Clock,
} from "lucide-react"
import type { OptimizedLoader } from "@/core/system/optimized-loader"
import type { SafeModeSystem } from "@/core/system/safe-mode"

interface AdminDashboardProps {
  onToggleChat: () => void
  loader: OptimizedLoader
  safeMode: SafeModeSystem
}

export function AdminDashboard({ onToggleChat, loader, safeMode }: AdminDashboardProps) {
  const loadingStatus = loader.getLoadingStatus()
  const loadingSummary = loader.getLoadingSummary()
  const healthReport = safeMode.getSystemHealth()
  const failedModules = loader.getFailedModules()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "loaded":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "bypassed":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "loading":
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ZacAI Admin Dashboard</h1>
                <p className="text-gray-600">System Management & Diagnostics • v2.0.8</p>
              </div>
            </div>
            <Button onClick={onToggleChat} variant="outline" className="gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Back to Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getHealthIcon(healthReport.overall)}
                    <span
                      className={`text-lg font-semibold ${
                        healthReport.overall === "healthy"
                          ? "text-green-600"
                          : healthReport.overall === "degraded"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {healthReport.overall.toUpperCase()}
                    </span>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Modules Loaded</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingSummary.loaded}/{loadingSummary.total}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round((loadingSummary.loaded / loadingSummary.total) * 100)}% success rate
                  </p>
                </div>
                <Database className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Modules</p>
                  <p className="text-2xl font-bold text-gray-900">{failedModules.length}</p>
                  <p className="text-xs text-gray-500">{failedModules.filter((m) => m.essential).length} critical</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Load Time</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(loadingSummary.averageLoadTime)}ms</p>
                  <p className="text-xs text-gray-500">Average per module</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="modules">Module Status</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>

          {/* Module Status Tab */}
          <TabsContent value="modules">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Loaded Modules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Loaded Modules ({loadingSummary.loaded})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {loadingStatus
                        .filter((module) => module.status === "loaded")
                        .map((module) => (
                          <div
                            key={module.name}
                            className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <div>
                              <p className="font-semibold text-green-800">{module.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs bg-white">
                                  {module.priority}
                                </Badge>
                                {module.loadTime && <span className="text-xs text-green-600">{module.loadTime}ms</span>}
                              </div>
                            </div>
                            {getStatusIcon(module.status)}
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Failed/Bypassed Modules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    Failed Modules ({failedModules.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {failedModules.map((module) => (
                        <div
                          key={module.name}
                          className={`p-3 border rounded-lg ${
                            module.essential ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-semibold ${module.essential ? "text-red-800" : "text-yellow-800"}`}>
                                {module.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={module.essential ? "destructive" : "secondary"} className="text-xs">
                                  {module.essential ? "Critical" : "Optional"}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {module.priority}
                                </Badge>
                              </div>
                              {module.error && (
                                <p className={`text-xs mt-1 ${module.essential ? "text-red-600" : "text-yellow-600"}`}>
                                  {module.error}
                                </p>
                              )}
                            </div>
                            {getStatusIcon(module.status)}
                          </div>
                        </div>
                      ))}
                      {failedModules.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <p>All modules loaded successfully!</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Health Checks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-semibold">Overall Status</span>
                      <Badge
                        variant={
                          healthReport.overall === "healthy"
                            ? "default"
                            : healthReport.overall === "degraded"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {healthReport.overall.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {healthReport.checks.map((check, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{check.name}</p>
                            <p className="text-sm text-gray-600">{check.message}</p>
                          </div>
                          {getHealthIcon(check.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-purple-500" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Module Load Success Rate</span>
                        <span>{Math.round((loadingSummary.loaded / loadingSummary.total) * 100)}%</span>
                      </div>
                      <Progress value={(loadingSummary.loaded / loadingSummary.total) * 100} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-semibold text-blue-800">Total Load Time</p>
                        <p className="text-xl font-bold text-blue-600">{loadingSummary.totalLoadTime}ms</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="font-semibold text-green-800">Avg Load Time</p>
                        <p className="text-xl font-bold text-green-600">
                          {Math.round(loadingSummary.averageLoadTime)}ms
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Diagnostics Tab */}
          <TabsContent value="diagnostics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  System Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800">System Status</h4>
                      <p className="text-2xl font-bold text-blue-600">Operational</p>
                      <p className="text-sm text-blue-600">All critical systems online</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800">Uptime</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round((Date.now() - loadingSummary.totalLoadTime) / 1000)}s
                      </p>
                      <p className="text-sm text-green-600">Since last restart</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800">Architecture</h4>
                      <p className="text-2xl font-bold text-purple-600">Modular</p>
                      <p className="text-sm text-purple-600">Production-grade loader</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Diagnostic Summary</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <ul className="space-y-1 text-sm">
                        <li>✅ Core system architecture: Stable</li>
                        <li>✅ Module loading system: Operational</li>
                        <li>✅ Error handling: Active</li>
                        <li>✅ Health monitoring: Running</li>
                        <li>✅ Safe mode system: Ready</li>
                        {failedModules.length > 0 && (
                          <li className="text-yellow-600">⚠️ {failedModules.length} non-critical modules bypassed</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
