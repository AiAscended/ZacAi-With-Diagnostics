"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReasoningEngine } from "@/lib/reasoning-engine"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface DiagnosticResult {
  test: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: any
}

export default function AIDiagnosticPanel() {
  const [aiSystem] = useState(() => new ReasoningEngine())
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const results: DiagnosticResult[] = []

    try {
      // Initialize system
      await aiSystem.initialize()

      // Test 1: Math Functions Initialization
      const mathFunctionCount = aiSystem.getMathFunctionCount()
      results.push({
        test: "Math Functions Count",
        status: mathFunctionCount > 0 ? "pass" : "fail",
        message: `Found ${mathFunctionCount} math functions`,
        details: { count: mathFunctionCount, type: typeof mathFunctionCount },
      })

      // Test 2: Stats Method
      const stats = aiSystem.getStats()
      results.push({
        test: "Stats Method - Math Functions",
        status: typeof stats.mathFunctions === "number" ? "pass" : "fail",
        message: `Math functions stat: ${stats.mathFunctions} (${typeof stats.mathFunctions})`,
        details: { value: stats.mathFunctions, type: typeof stats.mathFunctions },
      })

      // Test 3: Vocabulary Size
      results.push({
        test: "Vocabulary Size",
        status: stats.vocabularySize > 0 ? "pass" : "fail",
        message: `Vocabulary contains ${stats.vocabularySize} words`,
        details: { count: stats.vocabularySize },
      })

      // Test 4: Memory System
      results.push({
        test: "Memory System",
        status: stats.memoryEntries >= 0 ? "pass" : "fail",
        message: `Memory contains ${stats.memoryEntries} entries`,
        details: { count: stats.memoryEntries },
      })

      // Test 5: Math Processing
      const mathTest = await aiSystem.processMessage("Calculate 2 + 2")
      results.push({
        test: "Math Processing",
        status: mathTest.content.includes("4") ? "pass" : "warning",
        message: `Math test result: ${mathTest.content}`,
        details: { response: mathTest.content, confidence: mathTest.confidence },
      })

      // Test 6: Conversation Processing
      const conversationTest = await aiSystem.processMessage("Hello, how are you?")
      results.push({
        test: "Conversation Processing",
        status: conversationTest.confidence > 0.5 ? "pass" : "warning",
        message: `Conversation confidence: ${Math.round(conversationTest.confidence * 100)}%`,
        details: { response: conversationTest.content, confidence: conversationTest.confidence },
      })

      // Test 7: Memory Learning
      await aiSystem.processMessage("Remember that my name is TestUser")
      const memoryTest = await aiSystem.processMessage("What is my name?")
      results.push({
        test: "Memory Learning",
        status: memoryTest.content.toLowerCase().includes("testuser") ? "pass" : "warning",
        message: `Memory test: ${memoryTest.content.substring(0, 50)}...`,
        details: { response: memoryTest.content },
      })

      // Test 8: Data Export
      const exportData = aiSystem.exportData()
      results.push({
        test: "Data Export",
        status: exportData && exportData.conversations ? "pass" : "fail",
        message: `Export contains ${Object.keys(exportData).length} data types`,
        details: { keys: Object.keys(exportData) },
      })
    } catch (error) {
      results.push({
        test: "System Initialization",
        status: "fail",
        message: `Error: ${error}`,
        details: { error: error },
      })
    }

    setDiagnostics(results)
    setIsRunning(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "fail":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-800"
      case "fail":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const passCount = diagnostics.filter((d) => d.status === "pass").length
  const failCount = diagnostics.filter((d) => d.status === "fail").length
  const warningCount = diagnostics.filter((d) => d.status === "warning").length

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">🔍 AI System Diagnostics</CardTitle>
          <Button onClick={runDiagnostics} disabled={isRunning} variant="outline">
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Diagnostics
              </>
            )}
          </Button>
        </div>

        {diagnostics.length > 0 && (
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="bg-green-50">
              ✅ {passCount} Passed
            </Badge>
            <Badge variant="outline" className="bg-yellow-50">
              ⚠️ {warningCount} Warnings
            </Badge>
            <Badge variant="outline" className="bg-red-50">
              ❌ {failCount} Failed
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {diagnostics.map((diagnostic, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostic.status)}
                  <span className="font-medium">{diagnostic.test}</span>
                </div>
                <Badge className={getStatusColor(diagnostic.status)}>{diagnostic.status.toUpperCase()}</Badge>
              </div>

              <p className="text-sm text-gray-600 mb-2">{diagnostic.message}</p>

              {diagnostic.details && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Details</summary>
                  <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                    {JSON.stringify(diagnostic.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}

          {diagnostics.length === 0 && !isRunning && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No diagnostics run yet</p>
              <p className="text-sm">Click "Run Diagnostics" to test the system</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
