"use client"

import { useState } from "react"
import Header from "./header"
import Sidebar from "./sidebar"
import PortfolioSummary from "./portfolio-summary"
import AiRiskAnalysis from "./ai-risk-analysis"
import MarketViewsDynamic from "./market-views-dynamic"
import ScenarioAnalysis from "./scenario-analysis"
import OptionsPricer from "./options-pricer"
import Newsflow from "./newsflow"
import ChatSessionView from "./chat-session-view" // Added import
// import ChatOutputs from "./chat-outputs" // Commented out
import Settings from "./settings"
import AiAssistant from "./ai-assistant"
import { MarketViewsProvider } from "./market-views-context"

type View = "portfolio" | "airisk" | "scenario" | "market" | "newsflow" | "optionspricer" | "session" | "settings" // Updated type

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

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<View>("portfolio")
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [aiPanelExpanded, setAiPanelExpanded] = useState(true)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    // Initialize with existing sample sessions for backward compatibility
    {
      id: "session-1",
      title: "Fed Scenarios",
      lastActivity: new Date(Date.now() - 1000 * 60 * 30),
      messageCount: 12,
      threadId: "thread_session-1_existing",
      messages: [
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
          content: "I see three main scenarios: 1) Hawkish surprise (20% probability) - portfolio impact -$85k, 2) Base case pause (60% probability) - portfolio impact +$15k, 3) Dovish pivot (20% probability) - portfolio impact +$125k. Would you like me to analyze any specific scenario in detail?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 60000),
        },
      ],
    },
    {
      id: "session-2",
      title: "EUR/USD Volatility",
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
      messageCount: 9,
      threadId: "thread_session-2_existing",
      messages: [
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
          content: "The EUR/USD volatility surface shows a pronounced skew with 25-delta risk reversal at +0.8 vs historical average of +0.2. This suggests strong demand for EUR calls. The term structure is also inverted with 1M vol at 8.5% vs 3M at 7.8%.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3 + 60000),
        },
      ],
    },
    {
      id: "session-3",
      title: "BoJ Policy Impact",
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24),
      messageCount: 15,
      threadId: "thread_session-3_existing",
      messages: [
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
          content: "Based on recent BoJ communications and economic data, I assign a 35% probability to policy normalization (YCC adjustment or rate hike). Key factors: inflation above 2% for 8 months, wage growth accelerating, and Governor Ueda's recent hawkish comments.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25 + 60000),
        },
      ],
    },
  ])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // Function to generate a session title from the first user message
  const generateSessionTitle = (firstUserMessage: string): string => {
    // Simple heuristic to create meaningful titles
    const message = firstUserMessage.toLowerCase()
    
    if (message.includes('fed') || message.includes('federal reserve') || message.includes('fomc')) {
      return 'Fed Analysis'
    }
    if (message.includes('eur') && message.includes('usd')) {
      return 'EUR/USD Analysis'
    }
    if (message.includes('gbp')) {
      return 'GBP Analysis'
    }
    if (message.includes('jpy') || message.includes('yen') || message.includes('boj')) {
      return 'JPY Analysis'
    }
    if (message.includes('volatility') || message.includes('vol')) {
      return 'Volatility Analysis'
    }
    if (message.includes('risk') || message.includes('hedge')) {
      return 'Risk Analysis'
    }
    if (message.includes('portfolio')) {
      return 'Portfolio Discussion'
    }
    if (message.includes('scenario')) {
      return 'Scenario Analysis'
    }
    
    // Fallback: use first few words
    const words = firstUserMessage.split(' ').slice(0, 3).join(' ')
    return words.length > 20 ? words.substring(0, 20) + '...' : words
  }

  // Function to create a new chat session
  const createNewSession = (threadId?: string): string => {
    const newSessionId = `session-${Date.now()}`
    const newSession: ChatSession = {
      id: newSessionId,
      title: "New Chat",
      lastActivity: new Date(),
      messageCount: 0,
      threadId: threadId,
      messages: [],
    }
    
    setChatSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSessionId)
    setSelectedSession(null) // Clear selected session when creating new one
    setCurrentView("portfolio") // Go back to main view
    
    return newSessionId
  }

  // Function to update a session with new messages
  const updateSession = (sessionId: string, messages: Message[], threadId?: string) => {
    setChatSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        // Generate title from first user message if it's still "New Chat"
        let title = session.title
        if (title === "New Chat" && messages.length > 0) {
          const firstUserMessage = messages.find(m => m.role === "user")
          if (firstUserMessage) {
            title = generateSessionTitle(firstUserMessage.content)
          }
        }
        
        return {
          ...session,
          title,
          messages,
          messageCount: messages.filter(m => m.role === "user" || m.role === "assistant").length,
          lastActivity: new Date(),
          threadId: threadId || session.threadId,
        }
      }
      return session
    }))
  }

  // Function to get current session
  const getCurrentSession = (): ChatSession | null => {
    if (selectedSession) {
      return chatSessions.find(s => s.id === selectedSession) || null
    }
    if (currentSessionId) {
      return chatSessions.find(s => s.id === currentSessionId) || null
    }
    return null
  }

  const renderContent = () => {
    switch (currentView) {
      case "portfolio":
        return <PortfolioSummary />
      case "airisk":
        return <AiRiskAnalysis />
      case "scenario":
        return <ScenarioAnalysis />
      case "market":
        const currentSession = getCurrentSession()
        return <MarketViewsDynamic threadId={currentSession?.threadId} />
      case "newsflow":
        return <Newsflow />
      case "optionspricer":
        return <OptionsPricer />
      case "session":
        return selectedSession ? <ChatSessionView sessionId={selectedSession} /> : <PortfolioSummary />
      // case "chatoutputs": // Commented out
      //   return <ChatOutputs />
      case "settings":
        return <Settings />
      default:
        return <PortfolioSummary />
    }
  }

  return (
    <MarketViewsProvider>
      <div className="flex h-screen flex-col bg-background text-foreground">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            currentView={currentView}
            setCurrentView={setCurrentView}
            selectedSession={selectedSession}
            setSelectedSession={setSelectedSession}
            chatSessions={chatSessions}
          />
          <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
          <AiAssistant 
            expanded={aiPanelExpanded} 
            setExpanded={setAiPanelExpanded} 
            selectedSession={selectedSession}
            currentSessionId={currentSessionId}
            getCurrentSession={getCurrentSession}
            createNewSession={createNewSession}
            updateSession={updateSession}
          />
        </div>
      </div>
    </MarketViewsProvider>
  )
}
