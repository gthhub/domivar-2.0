"use client"
import { Separator } from "@/components/ui/separator"
import {
  BarChart3,
  Briefcase,
  Calculator,
  LineChart,
  Newspaper,
  SettingsIcon,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

type ChatSession = {
  id: string
  title: string
  lastActivity: Date
  messageCount: number
}

type SidebarProps = {
  currentView: string
  setCurrentView: (view: any) => void
  selectedSession: string | null
  setSelectedSession: (sessionId: string | null) => void
  chatSessions: ChatSession[]
}

export default function Sidebar({ currentView, setCurrentView, selectedSession, setSelectedSession, chatSessions }: SidebarProps) {
  const [sessionsExpanded, setSessionsExpanded] = useState(false)

  const menuItems = [
    {
      id: "portfolio",
      label: "Portfolio Summary",
      icon: Briefcase,
    },
    {
      id: "airisk",
      label: "AI Risk Analysis",
      icon: Zap,
    },
    {
      id: "scenario",
      label: "Scenario Analysis",
      icon: LineChart,
    },
    {
      id: "market",
      label: "Market Views Context",
      icon: BarChart3,
    },
    // Commented out Active Convictions
    // {
    //   id: "convictions",
    //   label: "Active Convictions",
    //   icon: TrendingUp,
    // },
    {
      id: "newsflow",
      label: "Newsflow",
      icon: Newspaper,
    },
    // {
    //   id: "optionspricer",
    //   label: "Options Pricer",
    //   icon: Calculator,
    // },
    // Commented out Chat Outputs
    // {
    //   id: "chatoutputs",
    //   label: "Chat Outputs",
    //   icon: MessageSquare,
    // },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
    },
  ]

  const formatLastActivity = (date: Date): string => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}d ago`
    }
  }

  const handleSessionClick = (sessionId: string) => {
    setSelectedSession(sessionId)
    setCurrentView("session") // Switch to session view
  }

  // Show only top 3 sessions when collapsed, all when expanded
  const visibleSessions = sessionsExpanded ? chatSessions : chatSessions.slice(0, 3)
  const hasMoreSessions = chatSessions.length > 3

  return (
    <div className="w-64 border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col">
      <div className="flex h-16 items-center border-b border-border px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <span className="text-xl font-bold text-primary rotate-90 -scale-x-100">σ</span>
          </div>
          <span className="text-lg font-semibold">Domivar</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setCurrentView(item.id)
                  setSelectedSession(null) // Clear session selection when navigating to main views
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  currentView === item.id && !selectedSession
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <Separator />

      {/* Chat Sessions Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Chat Sessions</h3>
            {hasMoreSessions && (
              <button
                onClick={() => setSessionsExpanded(!sessionsExpanded)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{sessionsExpanded ? "Show Less" : `+${chatSessions.length - 3} more`}</span>
                {sessionsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div
            className={cn(
              "px-4 pb-4 transition-all duration-300 ease-in-out",
              sessionsExpanded ? "overflow-y-auto h-full" : "overflow-hidden",
            )}
          >
            <ul className="space-y-1">
              {visibleSessions.map((session, index) => (
                <li key={session.id}>
                  <button
                    onClick={() => handleSessionClick(session.id)}
                    className={cn(
                      "flex w-full flex-col items-start gap-1 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      selectedSession === session.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className="font-medium truncate w-full">{session.title}</span>
                    <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                      <span>{session.messageCount} messages</span>
                      <span>{formatLastActivity(session.lastActivity)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Fade out gradient when not expanded */}
          {!sessionsExpanded && hasMoreSessions && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/95 to-transparent pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  )
}
