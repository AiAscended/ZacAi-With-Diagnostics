"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AIDiagnosticPanel from "@/components/ai-diagnostic-panel"
import PerformanceMonitorTab from "@/components/performance-monitor-tab"
import KnowledgeManagementTab from "@/components/knowledge-management-tab"
import MemorySystemTab from "@/components/memory-system-tab"
import SystemSettingsTab from "@/components/system-settings-tab"

export default function DiagnosticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🤖 AI System Diagnostics</h1>
          <p className="text-gray-600">Comprehensive testing and validation of the AI system components</p>
        </div>

        <Tabs defaultValue="diagnostics" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostics" className="space-y-6">
            <AIDiagnosticPanel />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-3">🎯 What We're Testing</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Math function initialization and counting</li>
                  <li>• Statistics method accuracy</li>
                  <li>• Vocabulary and memory systems</li>
                  <li>• Mathematical processing capabilities</li>
                  <li>• Conversational AI responses</li>
                  <li>• Memory learning and recall</li>
                  <li>• Data export functionality</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-3">🔧 Web3 Compliance</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• ✅ Browser-only architecture</li>
                  <li>• ✅ No external API dependencies</li>
                  <li>• ✅ IndexedDB for persistent storage</li>
                  <li>• ✅ TypeScript type safety</li>
                  <li>• ✅ Modular component design</li>
                  <li>• ✅ Error handling and recovery</li>
                  <li>• ✅ Performance optimized</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMonitorTab />
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeManagementTab />
          </TabsContent>

          <TabsContent value="memory">
            <MemorySystemTab />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
