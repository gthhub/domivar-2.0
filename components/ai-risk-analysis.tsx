"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Send,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Info,
  FileDown,
  Mail,
  Calendar,
  Clock,
  ChevronDown,
  BarChart3,
  Users,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format, addDays, addMonths } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

// Define the types of asset keys (same as in newsflow)
type AssetKey = {
  id: string
  name: string
  shape: "circle" | "square" | "triangle" | "diamond"
  color: string
}

// Define the macro event type
type MacroEvent = {
  id: string
  title: string
  date: Date
  type: "central-bank" | "economic-data" | "political" | "other"
  description: string
  relevantAssets: string[] // IDs of relevant assets
  impact: "high" | "medium" | "low"
}

// Asset keys definition - only currency pairs (same as in newsflow)
const assetKeys: AssetKey[] = [
  { id: "eurusd", name: "EUR/USD", shape: "circle", color: "bg-emerald-500" },
  { id: "usdjpy", name: "USD/JPY", shape: "square", color: "bg-red-500" },
  { id: "gbpusd", name: "GBP/USD", shape: "triangle", color: "bg-blue-500" },
  { id: "audusd", name: "AUD/USD", shape: "diamond", color: "bg-amber-500" },
  { id: "usdcad", name: "USD/CAD", shape: "circle", color: "bg-purple-500" },
  { id: "eurgbp", name: "EUR/GBP", shape: "square", color: "bg-indigo-500" },
  { id: "nzdusd", name: "NZD/USD", shape: "triangle", color: "bg-green-500" },
  { id: "usdchf", name: "USD/CHF", shape: "diamond", color: "bg-pink-500" },
]

// Sample upcoming macro events
const upcomingEvents: MacroEvent[] = [
  {
    id: "1",
    title: "Bank of Japan Policy Meeting",
    date: new Date(2025, 4, 22, 3, 0), // May 22, 2025, 3:00 AM
    type: "central-bank",
    description: "BoJ to decide on interest rates and potential YCC adjustments",
    relevantAssets: ["usdjpy", "eurjpy"],
    impact: "high",
  },
  {
    id: "2",
    title: "US Non-Farm Payrolls",
    date: new Date(2025, 5, 6, 12, 30), // June 6, 2025, 12:30 PM
    type: "economic-data",
    description: "May employment data release",
    relevantAssets: ["eurusd", "usdjpy", "gbpusd", "audusd", "usdcad", "usdchf"],
    impact: "high",
  },
  {
    id: "3",
    title: "Federal Reserve FOMC Meeting",
    date: new Date(2025, 5, 11, 18, 0), // June 11, 2025, 6:00 PM
    type: "central-bank",
    description: "Fed to announce interest rate decision and economic projections",
    relevantAssets: ["eurusd", "usdjpy", "gbpusd", "audusd", "usdcad", "usdchf"],
    impact: "high",
  },
  {
    id: "4",
    title: "UK General Election",
    date: new Date(2025, 6, 3, 7, 0), // July 3, 2025, 7:00 AM
    type: "political",
    description: "UK voters to elect new government",
    relevantAssets: ["gbpusd", "eurgbp"],
    impact: "high",
  },
  {
    id: "5",
    title: "ECB Monetary Policy Meeting",
    date: new Date(2025, 5, 18, 11, 45), // June 18, 2025, 11:45 AM
    type: "central-bank",
    description: "ECB to announce interest rate decision and policy statement",
    relevantAssets: ["eurusd", "eurgbp"],
    impact: "medium",
  },
  {
    id: "6",
    title: "Australia CPI Data",
    date: new Date(2025, 4, 28, 1, 30), // May 28, 2025, 1:30 AM
    type: "economic-data",
    description: "Q1 inflation data release",
    relevantAssets: ["audusd"],
    impact: "medium",
  },
]

// Consistent asset key indicator component (same as in newsflow)
function AssetKeyIndicator({ assetId }: { assetId: string }) {
  const asset = assetKeys.find((a) => a.id === assetId)
  if (!asset) return null

  // Consistent shape rendering
  let shapeClasses = ""

  switch (asset.shape) {
    case "circle":
      shapeClasses = `${asset.color} h-3 w-3 rounded-full`
      break
    case "square":
      shapeClasses = `${asset.color} h-3 w-3`
      break
    case "triangle":
      shapeClasses = `${asset.color} h-3 w-3 transform rotate-45`
      break
    case "diamond":
      shapeClasses = `${asset.color} h-3 w-3 transform rotate-45`
      break
  }

  return <div className={`${shapeClasses}`} title={asset.name} />
}

export default function AiRiskAnalysis() {
  const [inputMessage, setInputMessage] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState("15 minutes ago")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [timeframe, setTimeframe] = useState("1m")
  const [selectedEvent, setSelectedEvent] = useState<MacroEvent | null>(null)

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    // In a real app, this would send the message to the backend
    setInputMessage("")
  }

  const refreshAnalysis = () => {
    setIsAnalyzing(true)
    // Simulate analysis time
    setTimeout(() => {
      setIsAnalyzing(false)
      setLastUpdated("just now")
    }, 2000)
  }

  const handleExport = (type: "pdf" | "email") => {
    // In a real app, this would trigger the export functionality
    alert(`Exporting as ${type}...`)
  }

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value)
    setDate(undefined)

    // Set a date based on the timeframe
    const now = new Date()
    switch (value) {
      case "1w":
        setDate(addDays(now, 7))
        break
      case "1m":
        setDate(addMonths(now, 1))
        break
      case "3m":
        setDate(addMonths(now, 3))
        break
      case "6m":
        setDate(addMonths(now, 6))
        break
      case "1y":
        setDate(addMonths(now, 12))
        break
    }
  }

  const formatEventDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${format(date, "h:mm a")}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${format(date, "h:mm a")}`
    } else {
      return format(date, "MMM d, h:mm a")
    }
  }

  const getImpactBadgeColor = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-amber-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "central-bank":
        return <TrendingUp className="h-4 w-4 mr-1" />
      case "economic-data":
        return <BarChart3 className="h-4 w-4 mr-1" />
      case "political":
        return <Users className="h-4 w-4 mr-1" />
      default:
        return <Calendar className="h-4 w-4 mr-1" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Risk Analysis</h2>
          <p className="text-muted-foreground">
            Comprehensive risk analysis of your FX options portfolio across multiple scenarios
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Analysis Timeframe:</span>
            <div className="flex items-center gap-2">
              <Select value={timeframe} onValueChange={handleTimeframeChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1w">1 Week</SelectItem>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="custom">Custom Date</SelectItem>
                </SelectContent>
              </Select>

              {timeframe === "custom" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("email")}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={refreshAnalysis} disabled={isAnalyzing} size="icon">
              <RefreshCw className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat interface for overriding assumptions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Override Analysis Assumptions</CardTitle>
          <CardDescription>Provide specific market assumptions to customize the risk analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Example: 'I assign an 80% chance that the BoJ hikes at their upcoming meeting'"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} type="submit">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Try: "I think USDJPY and EURUSD will have a correlation of -0.5 rather than -0.8"
          </div>
        </CardContent>
      </Card>

      {/* Risk Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Summary</CardTitle>
          <CardDescription>Key risk metrics and potential exposures</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>High Risk Exposure</AlertTitle>
            <AlertDescription>
              Your portfolio has significant negative vega exposure to USD/JPY volatility, which conflicts with your
              market view of increased volatility following the BoJ meeting.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Expected P&L (1 Month)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-emerald-500" />
                  <span className="text-2xl font-bold text-emerald-500">+$42,500</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">68% confidence interval: -$28,000 to +$115,000</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tail Risk (99% VaR)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingDown className="mr-2 h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold text-red-500">-$185,000</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Driven by EUR/USD crash scenario</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Largest Exposure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">USD/JPY Vega</div>
                <p className="text-xs text-muted-foreground mt-1">-$65,000 per 1% vol change</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Macro Events Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Macro Events</CardTitle>
          <CardDescription>Major events that could impact your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Currency Key</h3>
            </div>
            <div className="flex flex-wrap gap-3 rounded-md border p-2">
              {assetKeys.map((asset) => (
                <div key={asset.id} className="flex items-center gap-1.5">
                  <AssetKeyIndicator assetId={asset.id} />
                  <span className="text-xs">{asset.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className={`overflow-hidden cursor-pointer hover:border-primary transition-colors ${
                  selectedEvent?.id === event.id ? "border-primary ring-1 ring-primary" : ""
                }`}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex">
                  <div className={`flex-shrink-0 w-1 ${getImpactBadgeColor(event.impact)}`}></div>
                  <div className="flex-grow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{formatEventDate(event.date)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 ml-4 flex-shrink-0">
                        {event.relevantAssets.map((assetId) => (
                          <AssetKeyIndicator key={assetId} assetId={assetId} />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{event.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <Badge className={getImpactBadgeColor(event.impact)}>
                        {event.impact.charAt(0).toUpperCase() + event.impact.slice(1)} Impact
                      </Badge>
                      <span className="text-xs text-primary">Click for analysis</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event-specific analysis (shown when an event is selected) */}
      {selectedEvent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Event Risk Analysis: {selectedEvent.title}</CardTitle>
              <Badge className={getImpactBadgeColor(selectedEvent.impact)}>
                {selectedEvent.impact.charAt(0).toUpperCase() + selectedEvent.impact.slice(1)} Impact
              </Badge>
            </div>
            <CardDescription>
              {formatEventDate(selectedEvent.date)} - Specific risk analysis for this event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Event-Specific Risk</AlertTitle>
              <AlertDescription>
                {selectedEvent.type === "central-bank"
                  ? "This central bank meeting could significantly impact volatility and directional moves in related currency pairs."
                  : selectedEvent.type === "economic-data"
                    ? "This economic data release may cause short-term volatility spikes in USD pairs."
                    : "This political event could create extended periods of uncertainty and volatility."}
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium mb-2">Potential Scenarios</h3>
                <div className="space-y-3">
                  <div className="rounded-md border p-3">
                    <h4 className="font-medium text-emerald-500">Bullish Scenario</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.type === "central-bank"
                        ? "More hawkish than expected policy stance"
                        : selectedEvent.type === "economic-data"
                          ? "Stronger than expected economic data"
                          : "Market-friendly political outcome"}
                    </p>
                    <p className="text-sm font-medium mt-1">Portfolio Impact: +$45,000</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <h4 className="font-medium text-amber-500">Base Case</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.type === "central-bank"
                        ? "Policy stance in line with market expectations"
                        : selectedEvent.type === "economic-data"
                          ? "Data in line with consensus forecasts"
                          : "Expected political outcome with some uncertainty"}
                    </p>
                    <p className="text-sm font-medium mt-1">Portfolio Impact: +$5,000</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <h4 className="font-medium text-red-500">Bearish Scenario</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.type === "central-bank"
                        ? "More dovish than expected policy stance"
                        : selectedEvent.type === "economic-data"
                          ? "Weaker than expected economic data"
                          : "Market-negative political outcome"}
                    </p>
                    <p className="text-sm font-medium mt-1">Portfolio Impact: -$65,000</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Affected Positions</h3>
                <div className="space-y-3">
                  {selectedEvent.relevantAssets.map((assetId) => {
                    const asset = assetKeys.find((a) => a.id === assetId)
                    return asset ? (
                      <div key={assetId} className="rounded-md border p-3">
                        <div className="flex items-center gap-2">
                          <AssetKeyIndicator assetId={assetId} />
                          <h4 className="font-medium">{asset.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {asset.name === "USD/JPY"
                            ? "Your short volatility position is at risk if the event causes a volatility spike."
                            : asset.name === "EUR/USD"
                              ? "Your long call options would benefit from increased volatility around this event."
                              : "Your position has moderate exposure to this event."}
                        </p>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Hedging Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Based on your current portfolio and the potential impact of this {selectedEvent.type} event, consider
                the following hedging strategies:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>
                  Purchase short-term {selectedEvent.relevantAssets.includes("usdjpy") ? "USD/JPY" : "EUR/USD"}{" "}
                  volatility to protect against event risk
                </li>
                <li>Consider a risk reversal strategy to maintain upside exposure while limiting downside risk</li>
                <li>Reduce position sizes temporarily until after the event if you want to minimize exposure</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
          <TabsTrigger value="distribution">P&L Distribution</TabsTrigger>
          <TabsTrigger value="correlations">Correlation Sensitivities</TabsTrigger>
          <TabsTrigger value="views">View Alignment</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Scenario Analysis</CardTitle>
              <CardDescription>
                AI-generated scenarios based on market conditions, your views, and newsflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge className="bg-red-500 mr-2">High Impact</Badge>
                      <h3 className="font-medium">BoJ Policy Normalization</h3>
                    </div>
                    <span className="text-red-500 font-medium">-$125,000</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Bank of Japan accelerates policy normalization, leading to rapid JPY strengthening and volatility
                    spike. Your USD/JPY put options would gain value, but not enough to offset losses from EUR/JPY
                    positions.
                  </p>
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Probability: 35% (based on recent BoJ commentary and your market views)</span>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge className="bg-emerald-500 mr-2">High Impact</Badge>
                      <h3 className="font-medium">Fed Dovish Pivot</h3>
                    </div>
                    <span className="text-emerald-500 font-medium">+$168,000</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Federal Reserve signals earlier-than-expected rate cuts, causing USD weakness across the board. Your
                    EUR/USD call options would significantly appreciate in value.
                  </p>
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Probability: 25% (based on recent Fed minutes and economic data)</span>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge className="bg-amber-500 mr-2">Medium Impact</Badge>
                      <h3 className="font-medium">Global Risk-Off Event</h3>
                    </div>
                    <span className="text-red-500 font-medium">-$82,000</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Unexpected geopolitical or economic shock triggers risk aversion, USD and JPY strengthen as safe
                    havens, while EUR and GBP weaken.
                  </p>
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Probability: 15% (based on current geopolitical tensions)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>P&L Probability Distribution</CardTitle>
              <CardDescription>Projected P&L outcomes across thousands of simulated market scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full bg-muted/30 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">P&L Distribution Chart Visualization</p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Distribution Statistics</h4>
                  <ul className="text-sm space-y-1">
                    <li>
                      <span className="font-medium">Expected P&L:</span> +$42,500
                    </li>
                    <li>
                      <span className="font-medium">Standard Deviation:</span> $72,000
                    </li>
                    <li>
                      <span className="font-medium">Skewness:</span> 0.35 (Positive Skew)
                    </li>
                    <li>
                      <span className="font-medium">Kurtosis:</span> 3.8 (Fat Tails)
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Risk Metrics</h4>
                  <ul className="text-sm space-y-1">
                    <li>
                      <span className="font-medium">95% VaR:</span> -$98,000
                    </li>
                    <li>
                      <span className="font-medium">99% VaR:</span> -$185,000
                    </li>
                    <li>
                      <span className="font-medium">Expected Shortfall (95%):</span> -$142,000
                    </li>
                    <li>
                      <span className="font-medium">Probability of Profit:</span> 68%
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Correlation Sensitivities</CardTitle>
              <CardDescription>
                Impact of changing correlations between currency pairs on portfolio risk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full bg-muted/30 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Correlation Matrix Visualization</p>
              </div>
              <div className="mt-4 space-y-4">
                <div className="rounded-md border p-4">
                  <h4 className="font-medium">EUR/USD and USD/JPY Correlation</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your portfolio is highly sensitive to changes in the EUR/USD and USD/JPY correlation. A shift from
                    the current -0.8 to -0.5 would reduce your portfolio's diversification benefit and increase overall
                    risk by approximately 15%.
                  </p>
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                    <span>
                      Your assumption override of -0.5 correlation increases your 95% VaR from -$98,000 to -$112,000
                    </span>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <h4 className="font-medium">G10 FX Correlation Regime</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The analysis indicates a 40% probability of shifting to a high-correlation regime across G10 FX in
                    the next month, which would reduce diversification benefits in your portfolio by approximately 25%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="views" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market View Alignment</CardTitle>
              <CardDescription>Analysis of how your portfolio aligns with your stated market views</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-red-500/10 text-red-500 border-red-500/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Critical Misalignment</AlertTitle>
                <AlertDescription>
                  Your view that "USD/JPY will decline in the short term as the Bank of Japan may signal policy
                  normalization" conflicts with your negative vega exposure to USD/JPY volatility.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">EUR/USD Bullish View</h4>
                    <Badge className="bg-emerald-500">Aligned</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your bullish view on EUR/USD aligns well with your portfolio's positive delta exposure to EUR/USD.
                    Your call options position would benefit from the expected EUR strength.
                  </p>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">USD/JPY Bearish View</h4>
                    <Badge className="bg-amber-500">Partially Aligned</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your bearish view on USD/JPY aligns with your delta exposure, but conflicts with your negative vega
                    exposure. If JPY strengthens with increased volatility (likely in a BoJ policy shift), your vega
                    losses could outweigh delta gains.
                  </p>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">EUR/USD Volatility Expectation</h4>
                    <Badge className="bg-emerald-500">Aligned</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your expectation of increased EUR/USD implied volatility aligns with your positive vega exposure to
                    EUR/USD.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
