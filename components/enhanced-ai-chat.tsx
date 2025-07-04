import type React from "react"
import { ThinkingProcess } from "./thinking-process"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  thinking?: string
  timestamp: number
  modules?: string[]
}

interface EnhancedAIChatProps {
  messages: Message[]
}

const EnhancedAIChat: React.FC<EnhancedAIChatProps> = ({ messages }) => {
  return (
    <div className="enhanced-ai-chat">
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.type}`}>
          <div className="message-content">{message.content}</div>
          <div className="message-timestamp">{new Date(message.timestamp).toLocaleTimeString()}</div>
          {message.type === "ai" && message.thinking && (
            <ThinkingProcess content={message.thinking} timestamp={new Date(message.timestamp).toLocaleTimeString()} />
          )}
        </div>
      ))}
    </div>
  )
}

export default EnhancedAIChat
