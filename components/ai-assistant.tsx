"use client"

import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, Send, Loader2, Expand, Shrink, PanelRightClose, MessageSquare, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useMarketViews } from "./market-views-context"

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
  analysisOutputs?: Array<any>
  hasUnviewedResults?: boolean
}

type AiAssistantProps = {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  selectedSession: string | null
  currentSessionId: string | null
  getCurrentSession: () => ChatSession | null
  createNewSession: (threadId?: string) => string
  updateSession: (sessionId: string, messages: Message[], threadId?: string) => void
  navigateToSessionResults?: (sessionId: string) => void
  addAnalysisOutput?: (sessionId: string, output: any) => void
}

export default function AiAssistant({ 
  expanded, 
  setExpanded, 
  selectedSession,
  currentSessionId,
  getCurrentSession,
  createNewSession,
  updateSession,
  navigateToSessionResults,
  addAnalysisOutput
}: AiAssistantProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isWideExpanded, setIsWideExpanded] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  // Add market views context
  const { updateMarketViews } = useMarketViews()

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

  // Check if we should show disclaimer based on session having AI responses
  const shouldShowDisclaimer = currentSession?.messages?.some(m => m.role === "assistant") || showDisclaimer

  // Reset disclaimer state when switching sessions
  useEffect(() => {
    const hasAIResponses = currentSession?.messages?.some(m => m.role === "assistant")
    setShowDisclaimer(hasAIResponses || false)
  }, [selectedSession, currentSessionId])

  // Function to extract and remove disclaimer from AI response
  const extractDisclaimer = (content: string): string => {
    // Match disclaimer patterns - handle both markdown and plain text
    const disclaimerPatterns = [
      /\*\*Disclaimer:\*\*.*$/i,
      /\*\*Disclaimer\*\*.*$/i,
      /Disclaimer:.*$/i,
      /\*\*Disclaimer:\*\*[\s\S]*$/i, // Multi-line
    ]
    
    let cleanContent = content
    disclaimerPatterns.forEach(pattern => {
      cleanContent = cleanContent.replace(pattern, '').trim()
    })
    
    return cleanContent
  }

  // Function to format message content for better readability
  const formatMessageContent = (content: string) => {
    if (!content) return content

    // Helper function to format inline text (bold, etc.)
    const formatInlineText = (text: string) => {
      // Handle bold text (**text** or __text__)
      const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                               .replace(/__(.*?)__/g, '<strong>$1</strong>')
      
      return <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
    }

    // Split into paragraphs and process each one
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim())
    
    return paragraphs.map((paragraph, index) => {
      // Handle numbered lists (1. 2. 3. etc.)
      if (/^\d+[.)]\s/.test(paragraph.trim())) {
        const items = paragraph.split(/(?=\d+[.)]\s)/).filter(item => item.trim())
        return (
          <ol key={index} className="list-decimal list-inside space-y-2 my-3 ml-2">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="leading-relaxed">
                {formatInlineText(item.replace(/^\d+[.)]\s/, ''))}
              </li>
            ))}
          </ol>
        )
      }
      
      // Handle bullet points or dashes
      if (/^[-•*]\s/.test(paragraph.trim())) {
        const items = paragraph.split(/(?=[-•*]\s)/).filter(item => item.trim())
        return (
          <ul key={index} className="list-disc list-inside space-y-2 my-3 ml-2">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="leading-relaxed">
                {formatInlineText(item.replace(/^[-•*]\s/, ''))}
              </li>
            ))}
          </ul>
        )
      }
      
      // Handle regular paragraphs with line breaks
      const lines = paragraph.split('\n').filter(line => line.trim())
      return (
        <div key={index} className="mb-4 last:mb-0">
          {lines.map((line, lineIndex) => (
            <div key={lineIndex} className="leading-relaxed mb-1 last:mb-0">
              {formatInlineText(line.trim())}
            </div>
          ))}
        </div>
      )
    })
  }

  // ✅ NEW: Function to process scenario analysis from LangGraph state
  const processScenarioAnalysis = (graphState: any, sessionId: string) => {
    console.log('processScenarioAnalysis called with sessionId:', sessionId)
    console.log('addAnalysisOutput function available?', !!addAnalysisOutput)
    
    // ✅ Extract original portfolio Greeks from priced_portfolio
    const originalPortfolioGreeks = graphState.priced_portfolio?.total ? {
      delta: graphState.priced_portfolio.total.delta || {},
      gamma: graphState.priced_portfolio.total.gamma || {},
      vega: graphState.priced_portfolio.total.vega || 0,
      theta: graphState.priced_portfolio.total.theta || 0,
      value: graphState.priced_portfolio.total.value || 0
    } : null
    
    console.log('🔍 Extracted original portfolio Greeks from priced_portfolio:', originalPortfolioGreeks)
    
    try {
      // Check for batch scenario analysis (most common case)
      if (graphState.batch_scenario_analysis) {
        console.log('✅ Found batch_scenario_analysis, processing...')
        console.log('Processing batch_scenario_analysis:', graphState.batch_scenario_analysis)
        
        const batchData = graphState.batch_scenario_analysis
        
        // ✅ Enhance scenario results with original portfolio Greeks if available
        let enhancedBatchData = batchData
        if (originalPortfolioGreeks && batchData.scenario_results) {
          enhancedBatchData = {
            ...batchData,
            scenario_results: batchData.scenario_results.map((scenario: any) => ({
              ...scenario,
              // Add original portfolio Greeks to each scenario for comparison
              original_portfolio_greeks: originalPortfolioGreeks,
              // Ensure original_greeks is populated with the real original data
              original_greeks: {
                delta: originalPortfolioGreeks.delta,
                gamma: originalPortfolioGreeks.gamma, 
                vega: originalPortfolioGreeks.vega,
                theta: originalPortfolioGreeks.theta,
                delta_total: Object.values(originalPortfolioGreeks.delta).reduce((sum: number, val: any) => sum + (val || 0), 0),
                gamma_total: Object.values(originalPortfolioGreeks.gamma).reduce((sum: number, val: any) => sum + (val || 0), 0)
              }
            }))
          }
          console.log('🔍 Enhanced batch data with original portfolio Greeks')
        }
        
        const analysisOutput = {
          id: `batch-scenario-${Date.now()}`,
          type: "scenario_analysis" as const,
          title: batchData.title || "Scenario Analysis",
          description: batchData.description || "AI-generated scenario analysis from chat",
          createdAt: new Date(),
          data: enhancedBatchData
        }
        
        if (addAnalysisOutput) {
          addAnalysisOutput(sessionId, analysisOutput)
          console.log('Added batch scenario analysis to session:', sessionId)
        }
      }
      
      // Check for individual scenario analysis
      else if (graphState.scenario_analysis) {
        console.log('✅ Found individual scenario_analysis, processing...')
        console.log('Processing individual scenario_analysis:', graphState.scenario_analysis)
        
        const scenarioData = graphState.scenario_analysis
        
        // ✅ Enhance with original portfolio Greeks
        const enhancedScenarioData = originalPortfolioGreeks ? {
          ...scenarioData,
          original_portfolio_greeks: originalPortfolioGreeks,
          original_greeks: {
            delta: originalPortfolioGreeks.delta,
            gamma: originalPortfolioGreeks.gamma,
            vega: originalPortfolioGreeks.vega,
            theta: originalPortfolioGreeks.theta,
            delta_total: Object.values(originalPortfolioGreeks.delta).reduce((sum: number, val: any) => sum + (val || 0), 0),
            gamma_total: Object.values(originalPortfolioGreeks.gamma).reduce((sum: number, val: any) => sum + (val || 0), 0)
          }
        } : scenarioData
        
        const analysisOutput = {
          id: `scenario-${Date.now()}`,
          type: "scenario_analysis" as const,
          title: scenarioData.scenario_name || "Individual Scenario Analysis",
          description: scenarioData.scenario_parameters?.narrative || "AI-generated scenario analysis",
          createdAt: new Date(),
          data: {
            summary_statistics: {
              total_scenarios: 1,
              successful_scenarios: 1,
              failed_scenarios: 0,
              processing_time_seconds: 1.0,
              total_execution_time: "1.0s",
              pnl_statistics: {
                min_pnl: scenarioData.pnl,
                max_pnl: scenarioData.pnl,
                avg_pnl: scenarioData.pnl,
                min_pnl_percent: scenarioData.pnl_percent,
                max_pnl_percent: scenarioData.pnl_percent,
                avg_pnl_percent: scenarioData.pnl_percent
              }
            },
            scenario_results: [enhancedScenarioData],
            timestamp: scenarioData.timestamp || new Date().toISOString()
          }
        }
        
        if (addAnalysisOutput) {
          addAnalysisOutput(sessionId, analysisOutput)
          console.log('Added individual scenario analysis to session:', sessionId)
        }
      }
      
      // Check for simplified scenario results format
      else if (graphState.scenario_results && Array.isArray(graphState.scenario_results)) {
        console.log('✅ Found scenario_results array, processing...')
        console.log('Processing scenario_results:', graphState.scenario_results)
        
        const scenarioResults = graphState.scenario_results
        
        // Check if the scenario results are already in the correct format
        const firstResult = scenarioResults[0]
        const isAlreadyFormatted = firstResult && 
          typeof firstResult.scenario_name === 'string' && 
          firstResult.original_greeks && 
          firstResult.new_greeks
        
        if (isAlreadyFormatted) {
          // ✅ Data is already in correct format, use it directly
          
          // ✅ Enhance scenarios with original portfolio Greeks if available
          const enhancedScenarioResults = originalPortfolioGreeks ? 
            scenarioResults.map((scenario: any) => ({
              ...scenario,
              original_portfolio_greeks: originalPortfolioGreeks,
              original_greeks: {
                delta: originalPortfolioGreeks.delta,
                gamma: originalPortfolioGreeks.gamma,
                vega: originalPortfolioGreeks.vega,
                theta: originalPortfolioGreeks.theta,
                delta_total: Object.values(originalPortfolioGreeks.delta).reduce((sum: number, val: any) => sum + (val || 0), 0),
                gamma_total: Object.values(originalPortfolioGreeks.gamma).reduce((sum: number, val: any) => sum + (val || 0), 0)
              }
            })) : scenarioResults
          
          const analysisOutput = {
            id: `scenario-results-${Date.now()}`,
            type: "scenario_analysis" as const,
            title: "Scenario Analysis Results",
            description: `Analysis of ${scenarioResults.length} scenarios`,
            createdAt: new Date(),
            data: {
              summary_statistics: {
                total_scenarios: scenarioResults.length,
                successful_scenarios: scenarioResults.length,
                failed_scenarios: 0,
                processing_time_seconds: 2.0,
                total_execution_time: "2.0s",
                pnl_statistics: {
                  min_pnl: Math.min(...scenarioResults.map((s: any) => s.pnl || 0)),
                  max_pnl: Math.max(...scenarioResults.map((s: any) => s.pnl || 0)),
                  avg_pnl: scenarioResults.reduce((sum: number, s: any) => sum + (s.pnl || 0), 0) / scenarioResults.length,
                  min_pnl_percent: Math.min(...scenarioResults.map((s: any) => s.pnl_percent || 0)),
                  max_pnl_percent: Math.max(...scenarioResults.map((s: any) => s.pnl_percent || 0)),
                  avg_pnl_percent: scenarioResults.reduce((sum: number, s: any) => sum + (s.pnl_percent || 0), 0) / scenarioResults.length
                }
              },
              scenario_results: enhancedScenarioResults,
              timestamp: new Date().toISOString()
            }
          }
          
          if (addAnalysisOutput) {
            addAnalysisOutput(sessionId, analysisOutput)
            console.log('Added scenario results (formatted) to session:', sessionId)
          }
        } else {
          // ⚠️ Data needs conversion - this should only happen if LangGraph sends simplified format
          console.warn('Scenario results need conversion from simplified format')
          
          const analysisOutput = {
            id: `scenario-results-${Date.now()}`,
            type: "scenario_analysis" as const,
            title: "Scenario Analysis Results",
            description: `Analysis of ${scenarioResults.length} scenarios`,
            createdAt: new Date(),
            data: {
              summary_statistics: {
                total_scenarios: scenarioResults.length,
                successful_scenarios: scenarioResults.length,
                failed_scenarios: 0,
                processing_time_seconds: 2.0,
                total_execution_time: "2.0s",
                pnl_statistics: {
                  min_pnl: Math.min(...scenarioResults.map((s: any) => s.pnl || 0)),
                  max_pnl: Math.max(...scenarioResults.map((s: any) => s.pnl || 0)),
                  avg_pnl: scenarioResults.reduce((sum: number, s: any) => sum + (s.pnl || 0), 0) / scenarioResults.length,
                  min_pnl_percent: Math.min(...scenarioResults.map((s: any) => s.pnl_percent || 0)),
                  max_pnl_percent: Math.max(...scenarioResults.map((s: any) => s.pnl_percent || 0)),
                  avg_pnl_percent: scenarioResults.reduce((sum: number, s: any) => sum + (s.pnl_percent || 0), 0) / scenarioResults.length
                }
              },
              scenario_results: scenarioResults.map((result: any) => ({
                scenario_name: result.name || result.scenario_name || "Unnamed Scenario",
                scenario_parameters: {
                  name: result.name || result.scenario_name || "Unnamed Scenario",
                  horizon_days: result.horizon_days || 7,
                  spot_sigma_mult: result.spot_sigma_mult || {},
                  vol_sigma_mult: result.vol_sigma_mult || {},
                  narrative: result.narrative || result.explanation || "No narrative provided"
                },
                original_portfolio_value: result.original_portfolio_value || 1250000,
                new_portfolio_value: result.new_portfolio_value || (1250000 + (result.pnl || 0)),
                pnl: result.pnl || 0,
                pnl_percent: result.pnl_percent || 0,
                spot_moves: result.spot_moves || {},
                original_greeks: result.original_greeks || {
                  delta: {},
                  gamma: {},
                  delta_total: 0,
                  gamma_total: 0,
                  vega: 0,
                  theta: 0
                },
                new_greeks: result.new_greeks || {
                  delta: {},
                  gamma: {},
                  delta_total: 0,
                  gamma_total: 0,
                  vega: 0,
                  theta: 0
                },
                scenario_totals: result.scenario_totals || {
                  value: result.new_portfolio_value || (1250000 + (result.pnl || 0)),
                  delta: {},
                  gamma: {},
                  vega: 0,
                  theta: 0,
                  greeks_currency: {
                    value: "USD",
                    delta: "by_currency",
                    gamma: "by_currency",
                    vega: "USD",
                    theta: "USD"
                  }
                },
                domestic_currency: result.domestic_currency || "USD",
                timestamp: result.timestamp || new Date().toISOString()
              })),
              timestamp: new Date().toISOString()
            }
          }
          
          if (addAnalysisOutput) {
            addAnalysisOutput(sessionId, analysisOutput)
            console.log('Added scenario results (converted) to session:', sessionId)
          }
        }
      }
      
      else {
        console.log('❌ No scenario analysis data found in graph state')
        console.log('Available keys in graphState:', Object.keys(graphState))
      }
      
    } catch (error) {
      console.error('Error processing scenario analysis:', error)
    }
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

    // For new sessions, add greeting message first
    const messagesWithGreeting = session?.messages?.length === 0 ? [
      {
        id: "greeting",
        role: "assistant" as const,
        content: "Hello! I'm Dom, your FX Options Trading AI assistant. Let's get started.",
        timestamp: new Date(),
      }
    ] : session?.messages || []

    // Update messages immediately for UI responsiveness
    const updatedMessages = [...messagesWithGreeting, userMessage]
    updateSession(sessionId, updatedMessages, session?.threadId)

    setInput("")
    setIsLoading(true)

    try {
      // Send the actual user message directly - let the API create the thread if needed
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          threadId: session?.threadId, // This will be null for new sessions, causing API to create thread
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()
      
      // ✅ NEW: Enhanced debugging for graph state
      console.log('=== FRONTEND GRAPH STATE DEBUG ===')
      console.log('Full API response data:', JSON.stringify(data, null, 2))
      console.log('Available data keys:', Object.keys(data))
      console.log('Has graph_state?', !!data.graph_state)
      
      if (data.graph_state) {
        console.log('Received graph state:', JSON.stringify(data.graph_state, null, 2))
        console.log('Market views specifically:', data.graph_state.market_views)
        console.log('Full state:', data.graph_state.full_state)
        
        // ✅ NEW: Detailed scenario debugging
        console.log('=== SCENARIO DEBUGGING ===')
        console.log('Has scenario_analysis?', !!data.graph_state.scenario_analysis)
        console.log('Has batch_scenario_analysis?', !!data.graph_state.batch_scenario_analysis)
        console.log('Has scenario_results?', !!data.graph_state.scenario_results)
        
        if (data.graph_state.scenario_analysis) {
          console.log('scenario_analysis data:', JSON.stringify(data.graph_state.scenario_analysis, null, 2))
        }
        if (data.graph_state.batch_scenario_analysis) {
          console.log('batch_scenario_analysis data:', JSON.stringify(data.graph_state.batch_scenario_analysis, null, 2))
        }
        if (data.graph_state.scenario_results) {
          console.log('scenario_results data:', JSON.stringify(data.graph_state.scenario_results, null, 2))
        }
        
        // Check full state for any other scenario-related fields
        if (data.graph_state.full_state) {
          console.log('All keys in full_state:', Object.keys(data.graph_state.full_state))
          const scenarioKeys = Object.keys(data.graph_state.full_state).filter(key => 
            key.toLowerCase().includes('scenario') || key.toLowerCase().includes('analysis')
          )
          console.log('Scenario-related keys in full_state:', scenarioKeys)
          scenarioKeys.forEach(key => {
            console.log(`${key}:`, data.graph_state.full_state[key])
          })
        }
        console.log('=== END SCENARIO DEBUGGING ===')
        
        // Update market views as before
        console.log('Calling updateMarketViews...')
        updateMarketViews(data.graph_state)
        console.log('updateMarketViews called successfully')

        // ✅ NEW: Process scenario analysis from LangGraph state
        console.log('About to call processScenarioAnalysis...')
        processScenarioAnalysis(data.graph_state, sessionId)
        console.log('processScenarioAnalysis called')
      } else {
        console.log('No graph_state received in API response')
        console.log('Available data keys:', Object.keys(data))
      }
      console.log('=== END FRONTEND DEBUG ===')
      
      // Extract content and remove disclaimer if present
      const rawContent = data.content || "I'm sorry, I couldn't process your request. Please try again."
      const cleanContent = extractDisclaimer(rawContent)
      
      // Show disclaimer if this is an AI response and we haven't shown it yet
      if (rawContent !== cleanContent) {
        setShowDisclaimer(true)
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: cleanContent,
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
    // Create a new session without a thread ID (thread will be created when first message is sent)
    const sessionId = createNewSession()
    
    // Add the introductory message to the new session
    const introMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "Hello! I'm Dom, your FX Options Trading AI assistant. Let's get started.",
      timestamp: new Date(),
    }
    
    updateSession(sessionId, [introMessage])
    
    // Reset disclaimer state for new conversation
    setShowDisclaimer(false)
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
          <MessageSquare className="h-4 w-4" />
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
              {isWideExpanded ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </Button>
            <CardTitle className="text-sm font-medium">{getSessionTitle()}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleNewConversation} className="h-8 px-2 border border-border">
              <Plus className="h-4 w-4" />
              <span className="text-xs">New</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setExpanded(false)} className="h-8 w-8">
              <PanelRightClose className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        {/* Sticky notification for results availability - moved outside CardContent */}
        {currentSession && (currentSession.analysisOutputs?.length ?? 0) > 0 && (
          <div className="sticky top-0 z-10 px-4 py-3 bg-background border-b">
            <Button
              variant={currentSession.hasUnviewedResults && selectedSession !== currentSession.id ? "default" : "outline"}
              size="sm"
              onClick={() => navigateToSessionResults?.(currentSession.id)}
              className={
                currentSession.hasUnviewedResults && selectedSession !== currentSession.id
                  ? "bg-blue-500 text-white hover:bg-blue-600 animate-pulse w-full"
                  : "text-blue-500 hover:text-blue-600 w-full"
              }
            >
              {currentSession.hasUnviewedResults && selectedSession !== currentSession.id ? (
                <>
                  <span className="mr-1">🔔</span>
                  New Analysis Results Available
                </>
              ) : (
                "View Analysis Results"
              )}
            </Button>
          </div>
        )}
        
        <CardContent className={`flex-1 overflow-auto p-4 relative ${isWideExpanded ? 'opacity-30' : ''}`}>
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
                  {formatMessageContent(message.content)}
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
          <div className="flex w-full flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex w-full items-center gap-2"
            >
              <Input
                placeholder={selectedSession ? "Continue this session..." : "What's on your mind?"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isLoading || isWideExpanded}
              />
              <Button type="submit" size="icon" className="h-8 w-8" disabled={isLoading || !input.trim() || isWideExpanded}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            
            {/* Disclaimer */}
            {shouldShowDisclaimer && (
              <div className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-md p-3 mt-1">
                <span className="font-bold text-red-500 mr-1">!</span>
                <span className="font-medium">Disclaimer:</span>
                <span className="italic ml-1">This information is for analytical purposes only, based on available data and models. It is strictly not financial advice and may contain errors. Always conduct your own research and consult with a qualified financial advisor before making any investment decisions.</span>
              </div>
            )}
          </div>
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
                <Shrink className="h-4 w-4" />
              </Button>
              <CardTitle className="text-sm font-medium">{getSessionTitle()}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleNewConversation} className="h-8 px-2 border border-border">
                <Plus className="h-4 w-4" />
                <span className="text-xs">New</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setExpanded(false)} className="h-8 w-8">
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          {/* Sticky notification for results availability - moved outside CardContent */}
          {currentSession && (currentSession.analysisOutputs?.length ?? 0) > 0 && (
            <div className="sticky top-0 z-10 px-4 py-3 bg-background border-b">
              <Button
                variant={currentSession.hasUnviewedResults && selectedSession !== currentSession.id ? "default" : "outline"}
                size="sm"
                onClick={() => navigateToSessionResults?.(currentSession.id)}
                className={
                  currentSession.hasUnviewedResults && selectedSession !== currentSession.id
                    ? "bg-blue-500 text-white hover:bg-blue-600 animate-pulse w-full"
                    : "text-blue-500 hover:text-blue-600 w-full"
                }
              >
                {currentSession.hasUnviewedResults && selectedSession !== currentSession.id ? (
                  <>
                    <span className="mr-1">🔔</span>
                    New Analysis Results Available
                  </>
                ) : (
                  "View Analysis Results"
                )}
              </Button>
            </div>
          )}
          
          <CardContent className="flex-1 overflow-auto p-4 relative">
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
                    {formatMessageContent(message.content)}
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
            <div className="flex w-full flex-col gap-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex w-full items-center gap-2"
              >
                <Input
                  placeholder={selectedSession ? "Continue this session..." : "What's on your mind?"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1"
                  disabled={isLoading || isWideExpanded}
                />
                <Button type="submit" size="icon" className="h-8 w-8" disabled={isLoading || !input.trim() || isWideExpanded}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
              
              {/* Disclaimer */}
              {shouldShowDisclaimer && (
                <div className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-md p-3 mt-1">
                  <span className="font-bold text-red-500 mr-1">!</span>
                  <span className="font-medium">Disclaimer:</span>
                  <span className="italic ml-1">This information is for analytical purposes only, based on available data and models. It is strictly not financial advice and may contain errors. Always conduct your own research and consult with a qualified financial advisor before making any investment decisions.</span>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  )
}