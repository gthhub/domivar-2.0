"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MessageSquare } from "lucide-react"

type SessionData = {
  id: string
  title: string
  description: string
  createdAt: Date
  lastActivity: Date
  messageCount: number
  analysisOutputs: AnalysisOutput[]
  summary: string
}

type AnalysisOutput = {
  id: string
  type: "scenario" | "distribution" | "correlation" | "custom"
  title: string
  description: string
  createdAt: Date
  data: any // This would contain the actual analysis data
}

// Sample session data
const sessionData: { [key: string]: SessionData } = {
  "session-1": {
    id: "session-1",
    title: "Upcoming Fed Scenarios",
    description: "Analysis of potential Federal Reserve policy outcomes and portfolio impact",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    lastActivity: new Date(Date.now() - 1000 * 60 * 30),
    messageCount: 12,
    summary:
      "Analyzed three Fed policy scenarios with portfolio impacts ranging from -$85k to +$125k. Identified key risk factors and hedging strategies for FOMC meeting.",
    analysisOutputs: [
      {
        id: "output-1",
        type: "scenario",
        title: "Fed Policy Scenarios Analysis",
        description: "Three scenarios: Hawkish surprise, Base case (pause), Dovish pivot",
        createdAt: new Date(Date.now() - 1000 * 60 * 45),
        data: {
          scenarios: [
            { name: "Hawkish Surprise", probability: 0.2, portfolioImpact: -85000 },
            { name: "Base Case (Pause)", probability: 0.6, portfolioImpact: 15000 },
            { name: "Dovish Pivot", probability: 0.2, portfolioImpact: 125000 },
          ],
        },
      },
      {
        id: "output-2",
        type: "distribution",
        title: "Fed Meeting P&L Distribution",
        description: "Probability distribution of portfolio outcomes around Fed meeting",
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        data: {
          expectedPnL: 28000,
          var95: -65000,
          var99: -95000,
          probabilityOfProfit: 0.72,
        },
      },
    ],
  },
  "session-2": {
    id: "session-2",
    title: "EUR/USD Volatility Analysis",
    description: "Deep dive into EUR/USD implied volatility patterns and trading opportunities",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
    messageCount: 8,
    summary:
      "Examined EUR/USD volatility surface anomalies and identified potential arbitrage opportunities. Recommended volatility trading strategies.",
    analysisOutputs: [
      {
        id: "output-3",
        type: "custom",
        title: "Volatility Surface Analysis",
        description: "Analysis of EUR/USD volatility skew and term structure",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
        data: {
          currentIV: 8.5,
          historicalIV: 7.2,
          skew25Delta: 0.8,
          recommendation: "Long volatility via straddle",
        },
      },
    ],
  },
  "session-3": {
    id: "session-3",
    title: "BoJ Policy Impact Assessment",
    description: "Assessment of Bank of Japan policy normalization impact on JPY positions",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25),
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24),
    messageCount: 15,
    summary:
      "Comprehensive analysis of BoJ policy shift scenarios and impact on USD/JPY positions. Identified significant vega risk exposure.",
    analysisOutputs: [
      {
        id: "output-4",
        type: "scenario",
        title: "BoJ Policy Normalization Scenarios",
        description: "Impact analysis of different BoJ policy paths",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24.5),
        data: {
          scenarios: [
            { name: "Gradual Normalization", probability: 0.5, portfolioImpact: -45000 },
            { name: "Aggressive Tightening", probability: 0.3, portfolioImpact: -125000 },
            { name: "Status Quo", probability: 0.2, portfolioImpact: 5000 },
          ],
        },
      },
    ],
  },
}

type ChatSessionViewProps = {
  sessionId: string
}

export default function ChatSessionView({ sessionId }: ChatSessionViewProps) {
  const session = sessionData[sessionId]

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Session not found</p>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const getAnalysisTypeColor = (type: string) => {
    switch (type) {
      case "scenario":
        return "bg-blue-500"
      case "distribution":
        return "bg-emerald-500"
      case "correlation":
        return "bg-purple-500"
      case "custom":
        return "bg-amber-500"
      default:
        return "bg-gray-500"
    }
  }

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case "scenario":
        return "Scenario Analysis"
      case "distribution":
        return "P&L Distribution"
      case "correlation":
        return "Correlation Analysis"
      case "custom":
        return "Custom Analysis"
      default:
        return "Analysis"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{session.title}</h2>
          <p className="text-muted-foreground">{session.description}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{session.messageCount} messages</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Last active: {formatDate(session.lastActivity)}</span>
          </div>
        </div>
      </div>

      {/* Session Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
          <CardDescription>Key insights and outcomes from this conversation</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{session.summary}</p>
        </CardContent>
      </Card>

      {/* Analysis Outputs */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Outputs</CardTitle>
          <CardDescription>Data analysis and insights generated during this session</CardDescription>
        </CardHeader>
        <CardContent>
          {session.analysisOutputs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No analysis outputs generated in this session</p>
          ) : (
            <div className="space-y-4">
              {session.analysisOutputs.map((output) => (
                <Card key={output.id} className="overflow-hidden">
                  <div className="flex">
                    <div className={`flex-shrink-0 w-1 ${getAnalysisTypeColor(output.type)}`}></div>
                    <div className="flex-grow p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{output.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{output.description}</p>
                        </div>
                        <Badge className={getAnalysisTypeColor(output.type)}>{getAnalysisTypeLabel(output.type)}</Badge>
                      </div>

                      {/* Display analysis data based on type */}
                      {output.type === "scenario" && output.data.scenarios && (
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-medium">Scenario Outcomes:</h4>
                          {output.data.scenarios.map((scenario: any, index: number) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span>
                                {scenario.name} ({(scenario.probability * 100).toFixed(0)}%)
                              </span>
                              <span className={scenario.portfolioImpact >= 0 ? "text-emerald-500" : "text-red-500"}>
                                {scenario.portfolioImpact >= 0 ? "+" : ""}${scenario.portfolioImpact.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {output.type === "distribution" && output.data && (
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Expected P&L:</span>
                            <div className="font-medium text-emerald-500">
                              +${output.data.expectedPnL.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">95% VaR:</span>
                            <div className="font-medium text-red-500">${output.data.var95.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">99% VaR:</span>
                            <div className="font-medium text-red-500">${output.data.var99.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Profit Probability:</span>
                            <div className="font-medium">{(output.data.probabilityOfProfit * 100).toFixed(0)}%</div>
                          </div>
                        </div>
                      )}

                      {output.type === "custom" && output.data && (
                        <div className="mt-4 space-y-2 text-sm">
                          {Object.entries(output.data).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, " $1")}:
                              </span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 text-xs text-muted-foreground">
                        Generated: {formatDate(output.createdAt)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
