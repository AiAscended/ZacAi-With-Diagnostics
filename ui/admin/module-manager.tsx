"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Database,
  Play,
  Pause,
  RotateCcw,
  Settings,
  BookOpen,
  Calculator,
  Globe,
  Code,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react"

interface ModuleManagerProps {
  modules: any
}

export default function ModuleManager({ modules }: ModuleManagerProps) {
  const [moduleStates, setModuleStates] = useState<{ [key: string]: boolean }>({
    vocabulary: true,
    mathematics: true,
    facts: true,
    coding: false,
    philosophy: false,
  })

  const getModuleIcon = (module: string) => {
    switch (module) {
      case "vocabulary":
        return <BookOpen className="h-5 w-5 text-blue-600" />
      case "mathematics":
        return <Calculator className="h-5 w-5 text-green-600" />
      case "facts":
        return <Globe className="h-5 w-5 text-purple-600" />
      case "coding":
        return <Code className="h-5 w-5 text-cyan-600" />
      case "philosophy":
        return <Lightbulb className="h-5 w-5 text-orange-600" />
      default:
        return <Database className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "loading":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const toggleModule = (moduleName: string) => {
    setModuleStates((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }))
  }

  const restartModule = (moduleName: string) => {
    console.log(`Restarting module: ${moduleName}`)
    // Add restart logic here
  }

  const configureModule = (moduleName: string) => {
    console.log(`Configuring module: ${moduleName}`)
    // Add configuration logic here
  }

  return (
    <div className="space-y-6">
      {/* Module Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Modules</p>
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(moduleStates).filter(Boolean).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Modules</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(moduleStates).length}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Load</p>
                <p className="text-2xl font-bold text-purple-600">67%</p>
              </div>
              <Progress value={67} className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Module Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(modules || {}).map(([name, module]: [string, any]) => (
              <div key={name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getModuleIcon(name)}
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">{name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(module.status)}
                        <span className="text-sm text-gray-600">
                          {module.status} • Load time: {module.loadTime}ms
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Enabled</span>
                      <Switch checked={moduleStates[name]} onCheckedChange={() => toggleModule(name)} />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restartModule(name)}
                        disabled={!moduleStates[name]}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => configureModule(name)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {moduleStates[name] && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Queries:</span>
                        <span className="ml-2 font-medium">42</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="ml-2 font-medium">95%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Response:</span>
                        <span className="ml-2 font-medium">150ms</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Memory:</span>
                        <span className="ml-2 font-medium">12MB</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Start All
            </Button>
            <Button variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Stop All
            </Button>
            <Button variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart All
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Global Config
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
