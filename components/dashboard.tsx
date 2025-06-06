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

// Enhanced analysis output types based on specification
type SpotMove = {
  original: number
  new: number
  move_percent: number
}

type Greeks = {
  delta: { [currency: string]: number }
  gamma: { [currency: string]: number }
  delta_total: number
  gamma_total: number
  vega: number
  theta: number
}

type ScenarioTotals = {
  value: number
  delta: { [currency: string]: number }
  gamma: { [currency: string]: number }
  vega: number
  theta: number
  greeks_currency: {
    value: string
    delta: string
    gamma: string
    vega: string
    theta: string
  }
}

type ScenarioParameters = {
  name: string
  horizon_days: number
  spot_sigma_mult: { [pair: string]: number }
  vol_sigma_mult: { [pair: string]: number }
  narrative: string
}

type IndividualScenarioResult = {
  scenario_name: string
  scenario_parameters: ScenarioParameters
  original_portfolio_value: number
  new_portfolio_value: number
  pnl: number
  pnl_percent: number
  spot_moves: { [pair: string]: SpotMove }
  original_greeks: Greeks
  new_greeks: Greeks
  scenario_totals: ScenarioTotals
  domestic_currency: string
  timestamp: string
}

type BatchScenarioAnalysis = {
  summary_statistics: {
    total_scenarios: number
    successful_scenarios: number
    failed_scenarios: number
    processing_time_seconds: number
    total_execution_time: string
    pnl_statistics: {
      min_pnl: number
      max_pnl: number
      avg_pnl: number
      min_pnl_percent: number
      max_pnl_percent: number
      avg_pnl_percent: number
    }
  }
  scenario_results: IndividualScenarioResult[]
  timestamp: string
}

type AnalysisOutput = {
  id: string
  type: "scenario_analysis" | "distribution_analysis" | "correlation_analysis" | "custom_analysis"
  title: string
  description: string
  createdAt: Date
  data: BatchScenarioAnalysis | IndividualScenarioResult | any // Support for other analysis types
}

type ChatSession = {
  id: string
  title: string
  lastActivity: Date
  messageCount: number
  threadId?: string
  messages: Message[]
  analysisOutputs: AnalysisOutput[] // Add analysis outputs to chat sessions
  hasUnviewedResults?: boolean // Flag to show "Take me to results" button
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
      analysisOutputs: [
        {
          id: "analysis-1",
          type: "scenario_analysis" as const,
          title: "Fed Meeting Impact Analysis",
          description: "Six key scenarios for the upcoming FOMC meeting and their portfolio impact",
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
          data: {
            summary_statistics: {
              total_scenarios: 6,
              successful_scenarios: 6,
              failed_scenarios: 0,
              processing_time_seconds: 2.7,
              total_execution_time: "2.7s",
              pnl_statistics: {
                min_pnl: -85000,
                max_pnl: 135000,
                avg_pnl: 20833,
                min_pnl_percent: -6.8,
                max_pnl_percent: 10.8,
                avg_pnl_percent: 1.67
              }
            },
            scenario_results: [
              {
                scenario_name: "Hawkish Surprise",
                scenario_parameters: {
                  name: "Fed 75bp Hike",
                  horizon_days: 7,
                  spot_sigma_mult: { "EURUSD": 2.5, "USDJPY": 2.0 },
                  vol_sigma_mult: { "EURUSD": 1.8, "USDJPY": 1.5 },
                  narrative: "Fed delivers unexpected 75bp rate hike, signaling aggressive tightening cycle"
                },
                original_portfolio_value: 1250000,
                new_portfolio_value: 1165000,
                pnl: -85000,
                pnl_percent: -6.8,
                spot_moves: {
                  "EURUSD": { original: 1.0825, new: 1.0580, move_percent: -2.26 },
                  "USDJPY": { original: 145.50, new: 148.20, move_percent: 1.86 }
                },
                original_greeks: {
                  delta: { "USD": 125000, "EUR": -50000, "JPY": 25000 },
                  gamma: { "USD": 8500, "EUR": -2000, "JPY": 1500 },
                  delta_total: 100000,
                  gamma_total: 8000,
                  vega: 95000,
                  theta: -12000
                },
                new_greeks: {
                  delta: { "USD": 98000, "EUR": -35000, "JPY": 35000 },
                  gamma: { "USD": 7200, "EUR": -1500, "JPY": 2000 },
                  delta_total: 98000,
                  gamma_total: 7700,
                  vega: 85000,
                  theta: -10500
                },
                scenario_totals: {
                  value: 1165000,
                  delta: { "USD": 98000, "EUR": -35000, "JPY": 35000 },
                  gamma: { "USD": 7200, "EUR": -1500, "JPY": 2000 },
                  vega: 85000,
                  theta: -10500,
                  greeks_currency: {
                    value: "USD",
                    delta: "by_currency",
                    gamma: "by_currency",
                    vega: "USD",
                    theta: "USD"
                  }
                },
                domestic_currency: "USD",
                timestamp: new Date().toISOString()
              },
              {
                scenario_name: "Base Case (25bp)",
                scenario_parameters: {
                  name: "Expected 25bp Hike",
                  horizon_days: 7,
                  spot_sigma_mult: { "EURUSD": 0.5, "USDJPY": 0.3 },
                  vol_sigma_mult: { "EURUSD": 0.8, "USDJPY": 0.6 },
                  narrative: "Fed delivers expected 25bp hike with balanced forward guidance"
                },
                original_portfolio_value: 1250000,
                new_portfolio_value: 1265000,
                pnl: 15000,
                pnl_percent: 1.2,
                spot_moves: {
                  "EURUSD": { original: 1.0825, new: 1.0885, move_percent: 0.55 },
                  "USDJPY": { original: 145.50, new: 144.80, move_percent: -0.48 }
                },
                original_greeks: {
                  delta: { "USD": 125000, "EUR": -50000, "JPY": 25000 },
                  gamma: { "USD": 8500, "EUR": -2000, "JPY": 1500 },
                  delta_total: 100000,
                  gamma_total: 8000,
                  vega: 95000,
                  theta: -12000
                },
                new_greeks: {
                  delta: { "USD": 130000, "EUR": -52000, "JPY": 22000 },
                  gamma: { "USD": 8800, "EUR": -2100, "JPY": 1400 },
                  delta_total: 100000,
                  gamma_total: 8100,
                  vega: 98000,
                  theta: -12200
                },
                scenario_totals: {
                  value: 1265000,
                  delta: { "USD": 130000, "EUR": -52000, "JPY": 22000 },
                  gamma: { "USD": 8800, "EUR": -2100, "JPY": 1400 },
                  vega: 98000,
                  theta: -12200,
                  greeks_currency: {
                    value: "USD",
                    delta: "by_currency",
                    gamma: "by_currency",
                    vega: "USD",
                    theta: "USD"
                  }
                },
                domestic_currency: "USD",
                timestamp: new Date().toISOString()
              },
              {
                scenario_name: "Dovish Pivot",
                scenario_parameters: {
                  name: "Fed Pause Signal",
                  horizon_days: 7,
                  spot_sigma_mult: { "EURUSD": -1.5, "USDJPY": -1.0 },
                  vol_sigma_mult: { "EURUSD": 1.2, "USDJPY": 0.9 },
                  narrative: "Fed signals pause in rate hikes citing economic slowdown concerns"
                },
                original_portfolio_value: 1250000,
                new_portfolio_value: 1375000,
                pnl: 125000,
                pnl_percent: 10.0,
                spot_moves: {
                  "EURUSD": { original: 1.0825, new: 1.1180, move_percent: 3.28 },
                  "USDJPY": { original: 145.50, new: 142.30, move_percent: -2.20 }
                },
                original_greeks: {
                  delta: { "USD": 125000, "EUR": -50000, "JPY": 25000 },
                  gamma: { "USD": 8500, "EUR": -2000, "JPY": 1500 },
                  delta_total: 100000,
                  gamma_total: 8000,
                  vega: 95000,
                  theta: -12000
                },
                new_greeks: {
                  delta: { "USD": 150000, "EUR": -75000, "JPY": 15000 },
                  gamma: { "USD": 9200, "EUR": -2800, "JPY": 1200 },
                  delta_total: 90000,
                  gamma_total: 7600,
                  vega: 110000,
                  theta: -13500
                },
                scenario_totals: {
                  value: 1375000,
                  delta: { "USD": 150000, "EUR": -75000, "JPY": 15000 },
                  gamma: { "USD": 9200, "EUR": -2800, "JPY": 1200 },
                  vega: 110000,
                  theta: -13500,
                  greeks_currency: {
                    value: "USD",
                    delta: "by_currency",
                    gamma: "by_currency",
                    vega: "USD",
                    theta: "USD"
                  }
                },
                domestic_currency: "USD",
                timestamp: new Date().toISOString()
              },
              {
                scenario_name: "Fed Pause + Hawkish Guidance",
                scenario_parameters: {
                  name: "Hold Rates, Signal Aggression",
                  horizon_days: 7,
                  spot_sigma_mult: { "EURUSD": -1.2, "USDJPY": 1.5 },
                  vol_sigma_mult: { "EURUSD": 1.0, "USDJPY": 0.8 },
                  narrative: "Fed holds rates but signals more aggressive hiking cycle ahead, USD strengthens"
                },
                original_portfolio_value: 1250000,
                new_portfolio_value: 1195000,
                pnl: -55000,
                pnl_percent: -4.4,
                spot_moves: {
                  "EURUSD": { original: 1.0825, new: 1.0695, move_percent: -1.20 },
                  "USDJPY": { original: 145.50, new: 147.68, move_percent: 1.50 }
                },
                original_greeks: {
                  delta: { "USD": 125000, "EUR": -50000, "JPY": 25000 },
                  gamma: { "USD": 8500, "EUR": -2000, "JPY": 1500 },
                  delta_total: 100000,
                  gamma_total: 8000,
                  vega: 95000,
                  theta: -12000
                },
                new_greeks: {
                  delta: { "USD": 115000, "EUR": -42000, "JPY": 32000 },
                  gamma: { "USD": 7900, "EUR": -1700, "JPY": 1900 },
                  delta_total: 105000,
                  gamma_total: 8100,
                  vega: 88000,
                  theta: -11200
                },
                scenario_totals: {
                  value: 1195000,
                  delta: { "USD": 115000, "EUR": -42000, "JPY": 32000 },
                  gamma: { "USD": 7900, "EUR": -1700, "JPY": 1900 },
                  vega: 88000,
                  theta: -11200,
                  greeks_currency: {
                    value: "USD",
                    delta: "by_currency",
                    gamma: "by_currency",
                    vega: "USD",
                    theta: "USD"
                  }
                },
                domestic_currency: "USD",
                timestamp: new Date().toISOString()
              },
              {
                scenario_name: "Emergency Rate Cut",
                scenario_parameters: {
                  name: "Fed Emergency Easing",
                  horizon_days: 1,
                  spot_sigma_mult: { "EURUSD": 2.2, "USDJPY": -1.8 },
                  vol_sigma_mult: { "EURUSD": 2.5, "USDJPY": 2.0 },
                  narrative: "Economic data deteriorates rapidly, Fed forced into emergency 50bp rate cut"
                },
                original_portfolio_value: 1250000,
                new_portfolio_value: 1385000,
                pnl: 135000,
                pnl_percent: 10.8,
                spot_moves: {
                  "EURUSD": { original: 1.0825, new: 1.1063, move_percent: 2.20 },
                  "USDJPY": { original: 145.50, new: 142.88, move_percent: -1.80 }
                },
                original_greeks: {
                  delta: { "USD": 125000, "EUR": -50000, "JPY": 25000 },
                  gamma: { "USD": 8500, "EUR": -2000, "JPY": 1500 },
                  delta_total: 100000,
                  gamma_total: 8000,
                  vega: 95000,
                  theta: -12000
                },
                new_greeks: {
                  delta: { "USD": 155000, "EUR": -78000, "JPY": 18000 },
                  gamma: { "USD": 9800, "EUR": -3200, "JPY": 1300 },
                  delta_total: 95000,
                  gamma_total: 7900,
                  vega: 135000,
                  theta: -16200
                },
                scenario_totals: {
                  value: 1385000,
                  delta: { "USD": 155000, "EUR": -78000, "JPY": 18000 },
                  gamma: { "USD": 9800, "EUR": -3200, "JPY": 1300 },
                  vega: 135000,
                  theta: -16200,
                  greeks_currency: {
                    value: "USD",
                    delta: "by_currency",
                    gamma: "by_currency",
                    vega: "USD",
                    theta: "USD"
                  }
                },
                domestic_currency: "USD",
                timestamp: new Date().toISOString()
              },
              {
                scenario_name: "Extended Pause + Neutral",
                scenario_parameters: {
                  name: "Fed Neutral Stance",
                  horizon_days: 14,
                  spot_sigma_mult: { "EURUSD": 0.3, "USDJPY": -0.2 },
                  vol_sigma_mult: { "EURUSD": -0.4, "USDJPY": -0.3 },
                  narrative: "Fed extends pause with neutral guidance, data-dependent approach, low volatility environment"
                },
                original_portfolio_value: 1250000,
                new_portfolio_value: 1275000,
                pnl: 25000,
                pnl_percent: 2.0,
                spot_moves: {
                  "EURUSD": { original: 1.0825, new: 1.0857, move_percent: 0.30 },
                  "USDJPY": { original: 145.50, new: 145.21, move_percent: -0.20 }
                },
                original_greeks: {
                  delta: { "USD": 125000, "EUR": -50000, "JPY": 25000 },
                  gamma: { "USD": 8500, "EUR": -2000, "JPY": 1500 },
                  delta_total: 100000,
                  gamma_total: 8000,
                  vega: 95000,
                  theta: -12000
                },
                new_greeks: {
                  delta: { "USD": 127000, "EUR": -51500, "JPY": 24500 },
                  gamma: { "USD": 8600, "EUR": -2050, "JPY": 1475 },
                  delta_total: 100000,
                  gamma_total: 8025,
                  vega: 82000,
                  theta: -9800
                },
                scenario_totals: {
                  value: 1275000,
                  delta: { "USD": 127000, "EUR": -51500, "JPY": 24500 },
                  gamma: { "USD": 8600, "EUR": -2050, "JPY": 1475 },
                  vega: 82000,
                  theta: -9800,
                  greeks_currency: {
                    value: "USD",
                    delta: "by_currency",
                    gamma: "by_currency",
                    vega: "USD",
                    theta: "USD"
                  }
                },
                domestic_currency: "USD",
                timestamp: new Date().toISOString()
              }
            ],
            timestamp: new Date().toISOString()
          } as BatchScenarioAnalysis
        }
      ],
      hasUnviewedResults: true,
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
      analysisOutputs: [],
      hasUnviewedResults: false,
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
      analysisOutputs: [],
      hasUnviewedResults: false,
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
      return 'Scenario Ladders'
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
      analysisOutputs: [],
      hasUnviewedResults: false,
    }
    
    setChatSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSessionId)
    setSelectedSession(null) // Clear selected session when creating new one
    
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

  // Function to add analysis output to a session
  const addAnalysisOutput = (sessionId: string, output: AnalysisOutput) => {
    setChatSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          analysisOutputs: [...session.analysisOutputs, output],
          hasUnviewedResults: true,
          lastActivity: new Date(),
        }
      }
      return session
    }))
  }

  // Function to mark session results as viewed
  const markResultsAsViewed = (sessionId: string) => {
    setChatSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          hasUnviewedResults: false,
        }
      }
      return session
    }))
  }

  // Function to navigate to session results
  const navigateToSessionResults = (sessionId: string) => {
    setCurrentView("session")
    setSelectedSession(sessionId)
    markResultsAsViewed(sessionId)
  }

  // Demo function to test adding analysis outputs
  const addDemoAnalysis = () => {
    const sessionId = currentSessionId || selectedSession
    if (!sessionId) return

    const demoOutput: AnalysisOutput = {
      id: `demo-${Date.now()}`,
      type: "scenario_analysis",
      title: "EUR/USD Volatility Spike Analysis",
      description: "Impact analysis of potential EUR/USD volatility spike scenarios",
      createdAt: new Date(),
      data: {
        summary_statistics: {
          total_scenarios: 2,
          successful_scenarios: 2,
          failed_scenarios: 0,
          processing_time_seconds: 2.7,
          total_execution_time: "2.7s",
          pnl_statistics: {
            min_pnl: -32000,
            max_pnl: 78000,
            avg_pnl: 23000,
            min_pnl_percent: -2.56,
            max_pnl_percent: 6.24,
            avg_pnl_percent: 1.84
          }
        },
        scenario_results: [
          {
            scenario_name: "Vol Spike + EUR Strength",
            scenario_parameters: {
              name: "ECB Hawkish + Vol Spike",
              horizon_days: 3,
              spot_sigma_mult: { "EURUSD": 1.5 },
              vol_sigma_mult: { "EURUSD": 2.0 },
              narrative: "ECB unexpectedly hawkish, driving EUR strength with elevated volatility"
            },
            original_portfolio_value: 1250000,
            new_portfolio_value: 1328000,
            pnl: 78000,
            pnl_percent: 6.24,
            spot_moves: {
              "EURUSD": { original: 1.0825, new: 1.1125, move_percent: 2.77 }
            },
            original_greeks: {
              delta: { "USD": 125000, "EUR": -50000 },
              gamma: { "USD": 8500, "EUR": -2000 },
              delta_total: 75000,
              gamma_total: 6500,
              vega: 95000,
              theta: -12000
            },
            new_greeks: {
              delta: { "USD": 145000, "EUR": -65000 },
              gamma: { "USD": 9200, "EUR": -2800 },
              delta_total: 80000,
              gamma_total: 6400,
              vega: 125000,
              theta: -15000
            },
            scenario_totals: {
              value: 1328000,
              delta: { "USD": 145000, "EUR": -65000 },
              gamma: { "USD": 9200, "EUR": -2800 },
              vega: 125000,
              theta: -15000,
              greeks_currency: {
                value: "USD",
                delta: "by_currency",
                gamma: "by_currency",
                vega: "USD",
                theta: "USD"
              }
            },
            domestic_currency: "USD",
            timestamp: new Date().toISOString()
          },
          {
            scenario_name: "Vol Spike + EUR Weakness",
            scenario_parameters: {
              name: "Risk-off + Vol Spike",
              horizon_days: 3,
              spot_sigma_mult: { "EURUSD": -1.2 },
              vol_sigma_mult: { "EURUSD": 2.0 },
              narrative: "Risk-off sentiment drives EUR weakness with elevated volatility"
            },
            original_portfolio_value: 1250000,
            new_portfolio_value: 1218000,
            pnl: -32000,
            pnl_percent: -2.56,
            spot_moves: {
              "EURUSD": { original: 1.0825, new: 1.0625, move_percent: -1.85 }
            },
            original_greeks: {
              delta: { "USD": 125000, "EUR": -50000 },
              gamma: { "USD": 8500, "EUR": -2000 },
              delta_total: 75000,
              gamma_total: 6500,
              vega: 95000,
              theta: -12000
            },
            new_greeks: {
              delta: { "USD": 108000, "EUR": -38000 },
              gamma: { "USD": 7800, "EUR": -1600 },
              delta_total: 70000,
              gamma_total: 6200,
              vega: 118000,
              theta: -14500
            },
            scenario_totals: {
              value: 1218000,
              delta: { "USD": 108000, "EUR": -38000 },
              gamma: { "USD": 7800, "EUR": -1600 },
              vega: 118000,
              theta: -14500,
              greeks_currency: {
                value: "USD",
                delta: "by_currency",
                gamma: "by_currency",
                vega: "USD",
                theta: "USD"
              }
            },
            domestic_currency: "USD",
            timestamp: new Date().toISOString()
          }
        ],
        timestamp: new Date().toISOString()
      } as BatchScenarioAnalysis
    }

    addAnalysisOutput(sessionId, demoOutput)
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
        if (selectedSession) {
          const sessionData = chatSessions.find(s => s.id === selectedSession)
          return sessionData ? <ChatSessionView session={sessionData} /> : <PortfolioSummary />
        }
        return <PortfolioSummary />
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
            navigateToSessionResults={navigateToSessionResults}
            addAnalysisOutput={addAnalysisOutput}
          />
        </div>
      </div>
    </MarketViewsProvider>
  )
}
