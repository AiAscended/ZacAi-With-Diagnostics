"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, AlertTriangle, CheckCircle, RefreshCw, Download, Cpu, HardDrive, Wifi, Database } from "lucide-react"

interface DiagnosticsPanelProps {
  stats: any
}

interface HealthCheck {
  name: string
  status: "healthy" | "warning" | "error"
  message: string
  timestamp: number
}

export default function DiagnosticsPanel({ stats }: DiagnosticsPanelProps) {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false)
  const [lastCheckTime, setLastCheckTime] = useState<number>(Date.now())

  useEffect(() => {
    runHealthChecks()
    const interval = setInterval(runHealthChecks, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const runHealthChecks = async () => {
    setIsRunningDiagnostics(true)

    // Simulate health checks
    const checks: HealthCheck[] = [
      {
        name: "Core System",
        status: "healthy",
        message: "All core systems operational",
        timestamp: Date.now(),
      },
      {
        name: "Memory Usage",
        status: "healthy",
        message: "Memory usage within normal limits (67%)",
        timestamp: Date.now(),
      },
      {
        name: "Storage",
        status: "healthy",
        message: "Local storage accessible and functional",
        timestamp: Date.now(),
      },
      {
        name: "Network",
        status: "warning",
        message: "Some API endpoints responding slowly",
        timestamp: Date.now(),
      },
      {
        name: "Modules",
        status: "healthy",
        message: "All active modules responding normally",
        timestamp: Date.now(),
      },
    ]

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setHealthChecks(checks)
    setLastCheckTime(Date.now())
    setIsRunningDiagnostics(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-50 text-green-700 border-green-200"
      case "warning":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "error":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const overallHealth =
    healthChecks.length > 0
      ? healthChecks.some((check) => check.status === "error")
        ? "error"
        : healthChecks.some((check) => check.status === "warning")
          ? "warning"
          : "healthy"
      : "unknown"

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Health</p>
                <p
                  className={`text-2xl font-bold ${
                    overallHealth === "healthy"
                      ? "text-green-600"
                      : overallHealth === "warning"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {overallHealth === "healthy" ? "Good" : overallHealth === "warning" ? "Warning" : "Error"}
                </p>
              </div>
              {getStatusIcon(overallHealth)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                <p className="text-2xl font-bold text-gray-900">23%</p>
              </div>
              <Cpu className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memory</p>
                <p className="text-2xl font-bold text-gray-900">67%</p>
              </div>
              <HardDrive className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Network</p>
                <p className="text-2xl font-bold text-yellow-600">Slow</p>
              </div>
              <Wifi className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diagnostics Tabs */}
      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="repair">Auto Repair</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health Checks
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={runHealthChecks} disabled={isRunningDiagnostics}>
                    {isRunningDiagnostics ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Run Checks
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600">Last check: {new Date(lastCheckTime).toLocaleTimeString()}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthChecks.map((check, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <h4 className="font-medium">{check.name}</h4>
                          <p className="text-sm opacity-80">{check.message}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(check.status)}>
                        {check.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>CPU Usage</span>
                    <span>23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Memory Usage</span>
                    <span>67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Storage Usage</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Network Latency</span>
                    <span>125ms</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                <div>[{new Date().toISOString()}] INFO: System health check completed</div>
                <div>[{new Date().toISOString()}] INFO: All modules responding normally</div>
                <div>[{new Date().toISOString()}] WARN: Network latency above threshold</div>
                <div>[{new Date().toISOString()}] INFO: Memory usage within normal limits</div>
                <div>[{new Date().toISOString()}] INFO: Storage cleanup completed</div>
                <div>[{new Date().toISOString()}] INFO: Vocabulary module processed 15 queries</div>
                <div>[{new Date().toISOString()}] INFO: Mathematics module processed 8 queries</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repair" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Auto Repair & Recovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">GitHub Integration</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Connect to GitHub for automatic backup and recovery capabilities.
                  </p>
                  <Button variant="outline" size="sm">
                    Configure GitHub Connection
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start bg-transparent">
                    <div className="font-medium mb-1">Clear Cache</div>
                    <div className="text-sm text-gray-600">Reset all cached data</div>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start bg-transparent">
                    <div className="font-medium mb-1">Reset Modules</div>
                    <div className="text-sm text-gray-600">Restart all modules</div>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start bg-transparent">
                    <div className="font-medium mb-1">Restore Backup</div>
                    <div className="text-sm text-gray-600">Load from stable version</div>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start bg-transparent">
                    <div className="font-medium mb-1">Factory Reset</div>
                    <div className="text-sm text-gray-600">Reset to default state</div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
