"use client"

// components/knowledge-viewer-tab.tsx
import { useState, useMemo } from "react"
import type { KnowledgeEntry } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface KnowledgeViewerTabProps {
  knowledgeData: Map<string, KnowledgeEntry>
  moduleName: string
}

export default function KnowledgeViewerTab({ knowledgeData, moduleName }: KnowledgeViewerTabProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const knowledgeArray = useMemo(() => {
    return Array.from(knowledgeData.entries())
  }, [knowledgeData])

  const filteredKnowledge = useMemo(() => {
    if (!searchTerm) return knowledgeArray
    return knowledgeArray.filter(([key, value]) => {
      const searchableValue = Object.values(value).join(" ").toLowerCase()
      return key.toLowerCase().includes(searchTerm.toLowerCase()) || searchableValue.includes(searchTerm.toLowerCase())
    })
  }, [knowledgeArray, searchTerm])

  if (!knowledgeData) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>This module's data is not available.</p>
      </div>
    )
  }

  const firstItem = knowledgeArray.length > 0 ? knowledgeArray[0][1] : {}
  const headers = Object.keys(firstItem).filter((key) => key !== "source" && key !== "timestamp")

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <Card className="flex-grow flex flex-col border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl">{moduleName} Knowledge Base</CardTitle>
          <CardDescription>
            Contains {knowledgeArray.length} total entries. Search through the loaded knowledge.
          </CardDescription>
          <Input
            placeholder={`Search in ${moduleName}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm mt-2"
          />
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
          <ScrollArea className="h-[calc(95vh - 240px)]">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  {headers.map((header) => (
                    <TableHead key={header} className="capitalize">
                      {header.replace(/_/g, " ")}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKnowledge.length > 0 ? (
                  filteredKnowledge.map(([key, value]) => (
                    <TableRow key={key}>
                      {headers.map((header) => (
                        <TableCell key={header} className="align-top">
                          <div className="max-w-xs truncate" title={String(value[header] ?? "")}>
                            {Array.isArray(value[header]) ? value[header].join(", ") : String(value[header] ?? "")}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={headers.length} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
