"use client"

import { useState } from "react"
import Header from "./header"
import Sidebar from "./sidebar"
import PortfolioSummary from "./portfolio-summary"
import AiRiskAnalysis from "./ai-risk-analysis"
import MarketViews from "./market-views"
import ScenarioAnalysis from "./scenario-analysis"
import OptionsPricer from "./options-pricer"
import Newsflow from "./newsflow"
import ChatSessionView from "./chat-session-view" // Added import
// import ChatOutputs from "./chat-outputs" // Commented out
import Settings from "./settings"
import AiAssistant from "./ai-assistant"

type View = "portfolio" | "airisk" | "scenario" | "market" | "newsflow" | "optionspricer" | "session" | "settings" // Updated type

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<View>("portfolio")
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [aiPanelExpanded, setAiPanelExpanded] = useState(true)

  const renderContent = () => {
    switch (currentView) {
      case "portfolio":
        return <PortfolioSummary />
      case "airisk":
        return <AiRiskAnalysis />
      case "scenario":
        return <ScenarioAnalysis />
      case "market":
        return <MarketViews />
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
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
        />
        <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
        <AiAssistant expanded={aiPanelExpanded} setExpanded={setAiPanelExpanded} selectedSession={selectedSession} />
      </div>
    </div>
  )
}
