"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Settings, Play, Pause, RefreshCw, AlertTriangle } from "lucide-react"

interface ModuleManagerProps {
  modules: any
}

export default function ModuleManager({ modules }: ModuleManagerProps) {
  const [moduleStates, setModuleStates] = useState(modules || {})

  const toggleModule = (moduleName: string) => {
    setModuleStates((prev: any) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        status: prev[moduleName].status === "active" ? "standby" : "active",
      },
    }))
  }

  const restartModule = (moduleName: string) => {
    // Simulate module restart
    setModuleStates((prev: any) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        status: "restarting",
      },
    }))

    setTimeout(() => {
      setModuleStates((prev: any) => ({
        ...prev,
        [moduleName]: {
          ...prev[moduleName],
          status: "active",
        },
      }))
    }, 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "standby":
        return "bg-yellow-100 text-yellow-800"
      case "restarting":
        return "bg-blue-100 text-blue-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="h-4 w-4" />
      case "standby":
        return <Pause className="h-4 w-4" />
      case "restarting":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Module Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(moduleStates).map(([name, module]: [string, any]) => (
              <Card key={name} className="border">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(module.status)}
                        <div>
                          <h3 className="font-semibold capitalize">{name}</h3>
                          <p className="text-sm text-gray-600">Load time: {module.loadTime}ms</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(module.status)}>{module.status}</Badge>
                        <Switch
                          checked={module.status === "active"}
                          onCheckedChange={() => toggleModule(name)}
                          disabled={module.status === "restarting"}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Performance</span>
                        <span>
                          {module.loadTime < 100 ? "Excellent" : module.loadTime < 200 ? "Good" : "Needs Optimization"}
                        </span>
                      </div>
                      <Progress value={module.loadTime < 100 ? 90 : module.loadTime < 200 ? 70 : 40} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restartModule(name)}
                        disabled={module.status === "restarting"}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${module.status === "restarting" ? "animate-spin" : ""}`} />
                        Restart
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Module Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(moduleStates).filter((m: any) => m.status === "active").length}
              </div>
              <div className="text-sm text-gray-600">Active Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {Object.values(moduleStates).filter((m: any) => m.status === "standby").length}
              </div>
              <div className="text-sm text-gray-600">Standby Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  Object.values(moduleStates).reduce((acc: number, m: any) => acc + m.loadTime, 0) /
                    Object.values(moduleStates).length,
                )}
                ms
              </div>
              <div className="text-sm text-gray-600">Avg Load Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
