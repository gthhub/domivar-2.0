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

type AiAssistantProps = {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  selectedSession: string | null
}

// Store thread IDs for each session
const sessionThreadIds: { [key: string]: string } = {}

// Update the sessionChatHistories with more comprehensive chat histories
const sessionChatHistories: { [key: string]: Message[] } = {
  "session-1": [
    {
      id: "1",
      role: "assistant",
      content: "I'll help you analyze potential Fed meeting scenarios and their impact on your portfolio.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "2",
      role: "user",
      content: "What are the main scenarios for the upcoming Fed meeting?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 30000),
    },
    {
      id: "3",
      role: "assistant",
      content:
        "I see three main scenarios: 1) Hawkish surprise (20% probability) - portfolio impact -$85k, 2) Base case pause (60% probability) - portfolio impact +$15k, 3) Dovish pivot (20% probability) - portfolio impact +$125k. Would you like me to analyze any specific scenario in detail?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 60000),
    },
  ],
  "session-2": [
    {
      id: "1",
      role: "assistant",
      content: "Let's analyze the EUR/USD volatility patterns you're interested in.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
    {
      id: "2",
      role: "user",
      content: "I notice the volatility surface looks unusual. Can you analyze the skew?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3 + 30000),
    },
    {
      id: "3",
      role: "assistant",
      content:
        "The EUR/USD volatility surface shows a pronounced skew with 25-delta risk reversal at +0.8 vs historical average of +0.2. This suggests strong demand for EUR calls. The term structure is also inverted with 1M vol at 8.5% vs 3M at 7.8%.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3 + 60000),
    },
    {
      id: "4",
      role: "user",
      content: "What's driving this unusual pattern? Is it sustainable?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3 + 90000),
    },
    {
      id: "5",
      role: "assistant",
      content:
        "The pattern is driven by: 1) Upcoming ECB meeting uncertainty, 2) US data releases this week, 3) Month-end rebalancing flows. The inversion suggests near-term event risk. I'd expect normalization after the ECB meeting unless there's a major surprise.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3 + 120000),
    },
    {
      id: "6",
      role: "user",
      content: "Should I be long or short volatility here?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3 + 150000),
    },
    {
      id: "7",
      role: "assistant",
      content:
        "Given your existing portfolio, I recommend being long volatility via a 1M straddle at 1.0825 strike. Your current vega exposure is +$45k, so this would increase it to +$67k. The risk/reward is favorable with realized vol at 6.2% vs implied at 8.5%.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3 + 180000),
    },
    {
      id: "8",
      role: "user",
      content: "What about the correlation with other pairs? Will this affect my GBP/USD position?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3 + 210000),
    },
    {
      id: "9",
      role: "assistant",
      content:
        "EUR/USD and GBP/USD correlation has increased to 0.82 from 0.65 last month. If EUR/USD vol spikes, expect GBP/USD to follow. Your GBP/USD call position would benefit from spillover effects. However, this reduces diversification - consider sizing down one of the positions.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3 + 240000),
    },
  ],
  "session-3": [
    {
      id: "1",
      role: "assistant",
      content: "I'll help you assess the potential impact of Bank of Japan policy changes on your JPY positions.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25),
    },
    {
      id: "2",
      role: "user",
      content: "What's the probability of BoJ policy normalization at the next meeting?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 30000),
    },
    {
      id: "3",
      role: "assistant",
      content:
        "Based on recent BoJ communications and economic data, I assign a 35% probability to policy normalization (YCC adjustment or rate hike). Key factors: inflation above 2% for 8 months, wage growth accelerating, and Governor Ueda's recent hawkish comments.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 60000),
    },
    {
      id: "4",
      role: "user",
      content: "How would that impact my USD/JPY positions specifically?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 90000),
    },
    {
      id: "5",
      role: "assistant",
      content:
        "Your USD/JPY exposure: Long 142.0 calls ($7M notional), Delta +$420k, Vega +$22k, Theta -$6.5k. Policy normalization would likely cause: 1) JPY strengthening (negative for your delta), 2) Vol spike (positive for vega), 3) Faster time decay. Net impact: approximately -$85k to -$125k depending on magnitude.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 120000),
    },
    {
      id: "6",
      role: "user",
      content: "What about my EUR/JPY exposure? I don't see it in my main positions.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 150000),
    },
    {
      id: "7",
      role: "assistant",
      content:
        "You have indirect EUR/JPY exposure through your EUR/USD long position. If BoJ normalizes policy, JPY strengthens against all currencies. Your EUR/USD gains would be partially offset by EUR/JPY weakness. The cross-currency impact adds about -$25k to your total BoJ scenario loss.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 180000),
    },
    {
      id: "8",
      role: "user",
      content: "Should I hedge this risk? What are my options?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 210000),
    },
    {
      id: "9",
      role: "assistant",
      content:
        "Three hedging strategies: 1) Buy USD/JPY puts (140.0 strike, 1M expiry) - cost $15k, max protection $65k, 2) Sell some USD/JPY call exposure - reduces upside but cuts risk, 3) Buy JPY strength via EUR/JPY puts - cheaper but less direct. I recommend option 1 given your risk tolerance.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 240000),
    },
    {
      id: "10",
      role: "user",
      content: "What if they don't normalize policy? What's the upside scenario?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 270000),
    },
    {
      id: "11",
      role: "assistant",
      content:
        "If BoJ maintains ultra-loose policy (65% probability), USD/JPY likely rallies toward 148-150. Your call options would be deeply ITM. Estimated gains: +$95k from delta, +$15k from reduced vol (vega loss), net +$80k. The asymmetric risk/reward favors maintaining some exposure while hedging tail risk.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 300000),
    },
    {
      id: "12",
      role: "user",
      content: "How does this align with my overall portfolio thesis?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 330000),
    },
    {
      id: "13",
      role: "assistant",
      content:
        "Your thesis of USD weakness vs EUR but strength vs JPY creates a natural hedge. BoJ normalization would hurt USD/JPY but help EUR/USD. However, the timing mismatch creates risk - BoJ could move before Fed dovish pivot. Consider reducing USD/JPY size or adding the hedge I mentioned.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 360000),
    },
    {
      id: "14",
      role: "user",
      content: "What are the key dates and events I should watch?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 390000),
    },
    {
      id: "15",
      role: "assistant",
      content:
        "Key dates: 1) BoJ meeting June 16th (policy decision), 2) Japan CPI June 23rd (inflation data), 3) BoJ Governor Ueda speech June 28th (forward guidance), 4) Japan wage negotiations ongoing (spring offensive results). Also watch 10Y JGB yield - if it hits 1.0%, YCC adjustment becomes more likely.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 420000),
    },
  ],
}

export default function AiAssistant({ expanded, setExpanded, selectedSession }: AiAssistantProps) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm Dom, your FX Options Trading AI assistant. Let's get started.",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)
  const [isWideExpanded, setIsWideExpanded] = useState(false)

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
          setCurrentThreadId(data.thread_id)
          if (selectedSession) {
            sessionThreadIds[selectedSession] = data.thread_id
          }
          console.log('Thread created automatically:', data.thread_id)
          
          // Don't add the initialization response to the chat if it's marked as initialization
          if (!data.isInitialization) {
            // Only add to messages if it's not an initialization call
            const aiMessage: Message = {
              id: Date.now().toString(),
              role: "assistant",
              content: data.content,
              timestamp: new Date(),
            }
            setMessages(prev => [...prev, aiMessage])
          }
        }
      }
    } catch (error) {
      console.error('Failed to create thread automatically:', error)
    }
  }

  // Update messages when session changes
  useEffect(() => {
    if (selectedSession && sessionChatHistories[selectedSession]) {
      setMessages(sessionChatHistories[selectedSession])
      // Use existing thread ID for this session or create a new one
      if (!sessionThreadIds[selectedSession]) {
        sessionThreadIds[selectedSession] = `thread_${selectedSession}_${Date.now()}`
      }
      setCurrentThreadId(sessionThreadIds[selectedSession])
    } else {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: "Hello! I'm Dom, your FX Options Trading AI assistant. Let's get started.",
          timestamp: new Date(),
        },
      ])
      setCurrentThreadId(null)
      // Create a new thread automatically when starting a new conversation
      createNewThread()
    }
  }, [selectedSession])

  // Also create a thread when component first mounts (if no session selected)
  useEffect(() => {
    if (!selectedSession && !currentThreadId) {
      createNewThread()
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
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
          threadId: currentThreadId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()
      
      if (data.thread_id) {
        setCurrentThreadId(data.thread_id)
        if (selectedSession) {
          sessionThreadIds[selectedSession] = data.thread_id
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])

    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewConversation = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Starting a new conversation. How can I help with your FX options trading strategies today?",
        timestamp: new Date(),
      },
    ])
    setCurrentThreadId(null)
    // Create a new thread automatically for the new conversation
    createNewThread()
  }

  // Update the getSessionTitle function to include all sessions
  const getSessionTitle = () => {
    if (!selectedSession) return "Domivar AI"

    const sessionTitles: { [key: string]: string } = {
      "session-1": "Fed Scenarios",
      "session-2": "EUR/USD Volatility",
      "session-3": "BoJ Policy Impact",
      "session-4": "Portfolio Hedging",
      "session-5": "GBP Election",
      "session-6": "AUD/USD Carry Trade",
      "session-7": "USD/CAD Oil Correlation",
      "session-8": "CHF Safe Haven",
    }

    return sessionTitles[selectedSession] || "Chat Session"
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
                {currentThreadId && (
                  <div className="mt-1 text-xs opacity-70">
                    Thread: {currentThreadId.slice(-8)}
                  </div>
                )}
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
                  {currentThreadId && (
                    <div className="mt-1 text-xs opacity-70">
                      Thread: {currentThreadId.slice(-8)}
                    </div>
                  )}
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
