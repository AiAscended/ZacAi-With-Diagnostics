"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Activity, Zap, Settings } from "lucide-react"

// Import all chat components
import DiagnosticChatWindow from "@/components/diagnostic-chat-window"
import CognitiveChatWindow from "@/components/cognitive-chat-window"
import EnhancedChatWindow from "@/components/enhanced-chat-window"
import ErrorBoundary from "@/components/error-boundary"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("diagnostic")

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">ZacAI</h1>
                  <p className="text-sm text-gray-600">Browser-Based Modular AI System</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Online
                </Badge>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="diagnostic" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Diagnostic AI
              </TabsTrigger>
              <TabsTrigger value="cognitive" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Cognitive AI
              </TabsTrigger>
              <TabsTrigger value="enhanced" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Enhanced AI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="diagnostic" className="mt-0">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Diagnostic AI System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Comprehensive system diagnostics with performance monitoring, memory tracking, and detailed
                    initialization logging.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">System Monitoring</Badge>
                    <Badge variant="secondary">Performance Metrics</Badge>
                    <Badge variant="secondary">Memory Tracking</Badge>
                    <Badge variant="secondary">Connection Testing</Badge>
                  </div>
                </CardContent>
              </Card>
              <DiagnosticChatWindow />
            </TabsContent>

            <TabsContent value="cognitive" className="mt-0">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Cognitive AI System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Advanced cognitive processing with online dictionary lookup, personal information extraction, and
                    enhanced reasoning capabilities.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Personal Info</Badge>
                    <Badge variant="secondary">Dictionary Lookup</Badge>
                    <Badge variant="secondary">Math Processing</Badge>
                    <Badge variant="secondary">Memory System</Badge>
                  </div>
                </CardContent>
              </Card>
              <CognitiveChatWindow />
            </TabsContent>

            <TabsContent value="enhanced" className="mt-0">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Enhanced AI System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Next-generation AI with advanced neural processing, quantum-inspired algorithms, and comprehensive
                    knowledge integration.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Neural Processing</Badge>
                    <Badge variant="secondary">Quantum Algorithms</Badge>
                    <Badge variant="secondary">Knowledge Integration</Badge>
                    <Badge variant="secondary">Advanced Learning</Badge>
                  </div>
                </CardContent>
              </Card>
              <EnhancedChatWindow />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  )
}
