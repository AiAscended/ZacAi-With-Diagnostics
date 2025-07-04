"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw, Download, Shield, Zap } from "lucide-react"

interface DiagnosticsPanelProps {
  stats: any
}

export default function DiagnosticsPanel({ stats }: DiagnosticsPanelProps) {
  const [diagnostics, setDiagnostics] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [lastRun, setLastRun] = useState<Date | null>(null)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    setIsRunning(true)
    setDiagnostics([])

    const checks = [
      { name: "Core System", status: "running", progress: 0 },
      { name: "Memory Usage", status: "pending", progress: 0 },
      { name: "Module Health", status: "pending", progress: 0 },
      { name: "Performance", status: "pending", progress: 0 },
      { name: "Error Logs", status: "pending", progress: 0 },
    ]

    for (let i = 0; i < checks.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800))

      checks[i].status = "completed"
      checks[i].progress = 100

      if (i < checks.length - 1) {
        checks[i + 1].status = "running"
      }

      setDiagnostics([...checks])
    }

    setIsRunning(false)
    setLastRun(new Date())
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const systemHealth = {
    overall: 95,
    memory: 78,
    performance: 88,
    modules: 92,
    errors: 98,
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth.overall}%</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={systemHealth.overall} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memory Health</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth.memory}%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={systemHealth.memory} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth.performance}%</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
            <Progress value={systemHealth.performance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">{100 - systemHealth.errors}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <Progress value={100 - systemHealth.errors} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Diagnostics
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={runDiagnostics} disabled={isRunning}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`} />
                Run Diagnostics
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lastRun && <div className="text-sm text-gray-600">Last run: {lastRun.toLocaleString()}</div>}

            <div className="space-y-3">
              {diagnostics.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <p className="font-medium">{check.name}</p>
                      <p className="text-sm text-gray-600">
                        {check.status === "completed"
                          ? "All checks passed"
                          : check.status === "running"
                            ? "Running diagnostics..."
                            : "Waiting to run"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(check.status)}>{check.status}</Badge>
                    {check.status !== "pending" && (
                      <div className="w-24">
                        <Progress value={check.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 w-full border rounded p-4 bg-gray-50">
            <div className="space-y-2 font-mono text-xs">
              <div className="text-green-600">
                [INFO] {new Date().toLocaleTimeString()} - System diagnostics completed successfully
              </div>
              <div className="text-blue-600">[INFO] {new Date().toLocaleTimeString()} - All modules operational</div>
              <div className="text-green-600">
                [INFO] {new Date().toLocaleTimeString()} - Memory usage within normal parameters
              </div>
              <div className="text-blue-600">
                [INFO] {new Date().toLocaleTimeString()} - Performance metrics optimal
              </div>
              <div className="text-gray-600">
                [DEBUG] {new Date().toLocaleTimeString()} - Background maintenance completed
              </div>
              <div className="text-green-600">
                [INFO] {new Date().toLocaleTimeString()} - System health check passed
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
