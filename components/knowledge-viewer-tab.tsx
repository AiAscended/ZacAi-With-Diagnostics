// components/knowledge-viewer-tab.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { KnowledgeEntry } from "@/lib/types"

interface KnowledgeViewerTabProps {
  data: Map<string, KnowledgeEntry> | null
  title: string
}

export default function KnowledgeViewerTab({ data, title }: KnowledgeViewerTabProps) {
  if (!data || data.size === 0) {
    return <div className="p-4 text-center text-muted-foreground">No {title} data loaded.</div>
  }

  const entries = Array.from(data.values())
  const headers = Object.keys(entries[0] || {}).filter((h) => !["timestamp"].includes(h))

  return (
    <ScrollArea className="h-[60vh] border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>{header.replace(/_/g, " ").toUpperCase()}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow key={index}>
              {headers.map((header) => (
                <TableCell key={header} className="max-w-[200px] truncate">
                  {typeof entry[header] === "string" ? entry[header] : JSON.stringify(entry[header])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}
