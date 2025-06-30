// components/ai-control-panel.tsx
"use client"

import { useState } from "react"
import type { CognitiveEngine } from "@/lib/cognitive-engine"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/ui/card"
import { BrainCircuit, BookOpen, MessageSquare, Settings } from "lucide-react"
import KnowledgeViewerTab from "./knowledge-viewer-tab"
import ChatTab from "./chat-tab"

interface AIControlPanelProps {
  engine: CognitiveEngine
}

export default function AIControlPanel({ engine }: AIControlPanelProps) {
  const [activeTab, setActiveTab] = useState("chat")

  return (
    <Card className="w-full max-w-7xl h-[90vh] flex flex-col bg-card/80 backdrop-blur-sm border-border/50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <CardHeader className="border-b border-border/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl font-bold">ZacAI Cognitive Engine</CardTitle>
                <p className="text-sm text-muted-foreground">Modular AI Control Panel</p>
              </div>
            </div>
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2" /> Chat
              </TabsTrigger>
              <TabsTrigger value="vocab">
                <BookOpen className="h-4 w-4 mr-2" /> Vocab
              </TabsTrigger>
              <TabsTrigger value="math">
                <span className="mr-2">🧮</span> Math
              </TabsTrigger>
              <TabsTrigger value="settings" disabled>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>

        <CardContent className="flex-grow p-0 overflow-y-auto">
          <TabsContent value="chat" className="m-0 h-full">
            <ChatTab engine={engine} />
          </TabsContent>
          <TabsContent value="vocab" className="m-0">
            <KnowledgeViewerTab module={engine.getModule("Vocabulary")} />
          </TabsContent>
          <TabsContent value="math" className="m-0">
            <KnowledgeViewerTab module={engine.getModule("Mathematics")} />
          </TabsContent>
          <TabsContent value="settings" className="m-0 p-6">
            <h2 className="text-xl font-semibold">System Settings</h2>
            <p className="text-muted-foreground">Module management will be available here.</p>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
