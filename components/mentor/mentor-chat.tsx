"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Send, 
  Loader2, 
  Sparkles, 
  User, 
  RefreshCw,
  Lightbulb,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MentorChatProps {
  userId: string
  userContext: {
    name: string
    skills: string[]
    headline: string
  }
}

const suggestedPrompts = [
  "How can I improve my resume for tech roles?",
  "What skills should I learn for a product manager role?",
  "How do I negotiate a higher salary?",
  "Tips for switching careers to tech",
  "How to prepare for behavioral interviews?",
]

export function MentorChat({ userId, userContext }: MentorChatProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ 
      api: "/api/mentor/chat",
      body: { userContext },
    }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage({ text: prompt })
  }

  const handleClearChat = () => {
    setMessages([])
  }

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hi {userContext.name}! I&apos;m your AI Career Mentor</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Ask me anything about career development, job searching, interview prep, skill building, or career transitions.
              </p>
              
              <div className="w-full max-w-md">
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedPrompts.map((prompt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSuggestedPrompt(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <div 
                            key={index} 
                            className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap"
                          >
                            {part.text}
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-secondary">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-muted flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          {messages.length > 0 && (
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="text-xs text-muted-foreground"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear chat
              </Button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your career mentor anything..."
              className="min-h-[44px] max-h-[200px] resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isLoading}
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
