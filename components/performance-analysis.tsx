"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Clock, Database, Network, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import { performanceMonitor } from "@/core/performance/monitor"

export default function PerformanceAnalysis() {
  const [metrics, setMetrics] = useState<any>(null)
  const [bottlenecks, setBottlenecks] = useState<any[]>([])
  const [report, setReport] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadPerformanceData()
  }, [])

  const loadPerformanceData = async () => {
    setIsLoading(true)
    try {
      const currentMetrics = performanceMonitor.getMetrics()
      const currentBottlenecks = performanceMonitor.getBottlenecks()
      const performanceReport = performanceMonitor.generateReport()

      setMetrics(currentMetrics)
      setBottlenecks(currentBottlenecks)
      setReport(performanceReport)
    } catch (error) {
      console.error("Failed to load performance data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getBottleneckIcon = (impact: string) => {
    switch (impact) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getBottleneckColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      default:
        return "default"
    }
  }

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading performance data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Analysis</h2>
          <p className="text-gray-600">System performance metrics and optimization recommendations</p>
        </div>
        <Button onClick={loadPerformanceData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{metrics.totalLoadTime.toFixed(0)}ms</div>
                <div className="text-sm text-gray-600">Total Load Time</div>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{metrics.memoryUsage.used}MB</div>
                <div className="text-sm text-gray-600">Memory Usage</div>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{metrics.networkRequests.count}</div>
                <div className="text-sm text-gray-600">Network Requests</div>
              </div>
              <Network className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{Object.keys(metrics.moduleInitTimes).length}</div>
                <div className="text-sm text-gray-600">Modules Loaded</div>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memory Usage Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Memory Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used: {metrics.memoryUsage.used}MB</span>
              <span>Limit: {metrics.memoryUsage.limit}MB</span>
            </div>
            <Progress value={(metrics.memoryUsage.used / metrics.memoryUsage.limit) * 100} className="h-2" />
            <div className="text-xs text-gray-500">
              {((metrics.memoryUsage.used / metrics.memoryUsage.limit) * 100).toFixed(1)}% of available memory
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="bottlenecks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          <TabsTrigger value="modules">Module Performance</TabsTrigger>
          <TabsTrigger value="stages">Loading Stages</TabsTrigger>
          <TabsTrigger value="report">Full Report</TabsTrigger>
        </TabsList>

        <TabsContent value="bottlenecks">
          <Card>
            <CardHeader>
              <CardTitle>Performance Bottlenecks</CardTitle>
            </CardHeader>
            <CardContent>
              {bottlenecks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No performance bottlenecks detected!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bottlenecks.map((bottleneck, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getBottleneckIcon(bottleneck.impact)}
                          <span className="font-medium">{bottleneck.name}</span>
                        </div>
                        <Badge variant={getBottleneckColor(bottleneck.impact)}>{bottleneck.impact.toUpperCase()}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Duration:</span> {bottleneck.duration.toFixed(2)}ms
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Recommendation:</span> {bottleneck.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Module Initialization Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(metrics.moduleInitTimes).map(([module, time]: [string, any]) => (
                  <div key={module} className="flex items-center justify-between">
                    <span className="font-medium">{module}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{time.toFixed(2)}ms</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min((time / 1000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages">
          <Card>
            <CardHeader>
              <CardTitle>Loading Stage Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(metrics.loadingStages).map(([stage, time]: [string, any]) => (
                  <div key={stage} className="flex items-center justify-between">
                    <span className="font-medium">{stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{time.toFixed(2)}ms</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min((time / metrics.totalLoadTime) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Report</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <pre className="text-xs font-mono whitespace-pre-wrap">{report}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
