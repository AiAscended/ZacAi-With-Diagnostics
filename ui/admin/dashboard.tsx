"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Shield, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"
import type { OptimizedLoader } from "@/core/system/optimized-loader"
import type { SafeModeSystem } from "@/core/system/safe-mode"

interface AdminDashboardProps {
  onToggleChat: () => void
  loader: OptimizedLoader
  safeMode: SafeModeSystem
}

export function AdminDashboard({ onToggleChat, loader, safeMode }: AdminDashboardProps) {
  const loadingStatus = loader.getLoadingStatus()
  const healthReport = safeMode.getSystemHealth()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "loaded":
        return <CheckCircle className="text-green-500" />
      case "failed":
        return <XCircle className="text-red-500" />
      case "loading":
        return <AlertTriangle className="text-yellow-500" />
      default:
        return <Info className="text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <Button onClick={onToggleChat} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
        </div>

        <Tabs defaultValue="health">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="health">System Health</TabsTrigger>
            <TabsTrigger value="modules">Module Status</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield /> System Health & Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {healthReport ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Overall Status:</span>
                      <Badge variant={healthReport.overall === "healthy" ? "default" : "destructive"}>
                        {healthReport.overall.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {healthReport.checks.map((check) => (
                        <div key={check.name} className="p-3 border rounded-md bg-gray-50">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{check.name}</p>
                            {getStatusIcon(check.status === "healthy" ? "loaded" : "failed")}
                          </div>
                          <p className="text-sm text-gray-600">{check.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p>No health report available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Module Loading Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {loadingStatus.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-semibold capitalize">{item.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              item.status === "loaded"
                                ? "text-green-600"
                                : item.status === "failed"
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                          {getStatusIcon(item.status)}
                        </div>
                      </div>
                    ))}
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
