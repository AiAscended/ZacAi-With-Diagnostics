"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

type KnowledgeItem = {
  id: string
  question: string
  answer: string
  category: string
}

export function KnowledgeManagementTab() {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // In a real app, this would fetch from a database.
    // For now, we'll use mock data.
    const mockKnowledge: KnowledgeItem[] = [
      { id: "1", question: "What is the capital of France?", answer: "Paris", category: "Geography" },
      { id: "2", question: "What is 2 + 2?", answer: "4", category: "Math" },
      { id: "3", question: "What is the formula for water?", answer: "H2O", category: "Science" },
    ]
    setKnowledgeBase(mockKnowledge)
  }, [])

  const handleAddItem = () => {
    if (newQuestion && newAnswer && newCategory) {
      const newItem: KnowledgeItem = {
        id: (knowledgeBase.length + 1).toString(),
        question: newQuestion,
        answer: newAnswer,
        category: newCategory,
      }
      setKnowledgeBase([...knowledgeBase, newItem])
      setNewQuestion("")
      setNewAnswer("")
      setNewCategory("")
    }
  }

  const handleDeleteItem = (id: string) => {
    setKnowledgeBase(knowledgeBase.filter((item) => item.id !== id))
  }

  const filteredKnowledge = knowledgeBase.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Knowledge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Question" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} />
          <Input placeholder="Answer" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} />
          <Input placeholder="Category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddItem}>Add Item</Button>
        </CardFooter>
      </Card>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Knowledge Base</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-2 p-0">
          <div className="px-6 pb-2">
            <Input
              placeholder="Search knowledge base..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4">
              {filteredKnowledge.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-semibold">{item.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-sm">
                    <p>
                      <span className="font-semibold">Answer:</span> {item.answer}
                    </p>
                    <p>
                      <span className="font-semibold">Category:</span> {item.category}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4">
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
