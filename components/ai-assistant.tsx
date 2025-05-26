"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type ChatSession = {
  id: string
  title: string
  lastActivity: Date
  messageCount: number
  threadId?: string
  messages: Message[]
}

type AiAssistantProps = {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  selectedSession: string | null
  currentSessionId: string | null
  getCurrentSession: () => ChatSession | null
  createNewSession: (threadId?: string) => string
  updateSession: (sessionId: string, messages: Message[], threadId?: string) => void
}

export default function AiAssistant({ 
  expanded, 
  setExpanded, 
  selectedSession,
  currentSessionId,
  getCurrentSession,
  createNewSession,
  updateSession 
}: AiAssistantProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isWideExpanded, setIsWideExpanded] = useState(false)

  // Get messages from current session
  const currentSession = getCurrentSession()
  const messages = currentSession?.messages || [
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm Dom, your FX Options Trading AI assistant. Let's get started.",
      timestamp: new Date(),
    },
  ]

  // Function to create a new thread automatically
  const createNewThread = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "Initialize thread", // Simple initialization message
          threadId: null, // No existing thread
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.thread_id) {
          console.log('Thread created automatically:', data.thread_id)
          return data.thread_id
        }
      }
    } catch (error) {
      console.error('Failed to create thread automatically:', error)
    }
    return null
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    // Determine which session to use
    let sessionId = selectedSession || currentSessionId
    let session = getCurrentSession()

    // If no active session, create a new one
    if (!sessionId || !session) {
      sessionId = createNewSession()
      session = getCurrentSession()
    }

    // Update messages immediately for UI responsiveness
    const updatedMessages = [...(session?.messages || []), userMessage]
    updateSession(sessionId, updatedMessages, session?.threadId)

    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          threadId: session?.threadId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
      }

      // Update the session with the AI response and thread ID
      const finalMessages = [...updatedMessages, aiMessage]
      updateSession(sessionId, finalMessages, data.thread_id || session?.threadId)

    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      
      // Update session with error message
      const finalMessages = [...updatedMessages, errorMessage]
      updateSession(sessionId, finalMessages, session?.threadId)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewConversation = async () => {
    // Create a new thread first
    const threadId = await createNewThread()
    
    // Create a new session with the thread ID
    createNewSession(threadId)
  }

  // Update the getSessionTitle function to work with current session
  const getSessionTitle = () => {
    if (selectedSession) {
      const session = getCurrentSession()
      return session?.title || "Chat Session"
    }
    
    if (currentSessionId) {
      const session = getCurrentSession()
      return session?.title || "New Chat"
    }
    
    return "Domivar AI"
  }

  if (!expanded) {
    return (
      <div className="flex flex-col items-center border-l border-border bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button variant="ghost" size="icon" onClick={() => setExpanded(true)} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Original chat that maintains layout space */}
      <Card className="flex h-full w-80 flex-col border-l border-r-0 border-t-0 border-b-0 rounded-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsWideExpanded(!isWideExpanded)} 
              className="h-8 w-8"
              title={isWideExpanded ? "Collapse chat" : "Expand chat"}
            >
              {isWideExpanded ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <CardTitle className="text-sm font-medium">{getSessionTitle()}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleNewConversation} className="h-8 px-2">
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs">New</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setExpanded(false)} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className={`flex-1 overflow-auto p-4 ${isWideExpanded ? 'opacity-30' : ''}`}>
          <div className="space-y-4">
            {selectedSession && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2 mb-4">
                Viewing chat history for: {getSessionTitle()}
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Dom is thinking...
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className={`p-3 pt-0 ${isWideExpanded ? 'opacity-30' : ''}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex w-full items-center gap-2"
          >
            <Input
              placeholder={selectedSession ? "Continue this session..." : "Ask about FX strategies..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              disabled={isLoading || isWideExpanded}
            />
            <Button type="submit" size="icon" className="h-8 w-8" disabled={isLoading || !input.trim() || isWideExpanded}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>

      {/* Expanded overlay */}
      {isWideExpanded && (
        <Card className="fixed right-0 top-0 z-50 flex h-full w-[640px] flex-col border-l border-r-0 border-t-0 border-b-0 rounded-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsWideExpanded(false)} 
                className="h-8 w-8"
                title="Collapse chat"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <CardTitle className="text-sm font-medium">{getSessionTitle()}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleNewConversation} className="h-8 px-2">
                <Plus className="h-4 w-4 mr-1" />
                <span className="text-xs">New</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setExpanded(false)} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {selectedSession && (
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2 mb-4">
                  Viewing chat history for: {getSessionTitle()}
                </div>
              )}
              
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Dom is thinking...
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-3 pt-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex w-full items-center gap-2"
            >
              <Input
                placeholder={selectedSession ? "Continue this session..." : "Ask about FX strategies..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" className="h-8 w-8" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
