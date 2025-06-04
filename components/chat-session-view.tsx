"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, MessageSquare, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Activity, DollarSign, Search } from "lucide-react"

// Import types from dashboard (these should be shared in a types file)
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
  data: BatchScenarioAnalysis | IndividualScenarioResult | any
}

type ChatSession = {
  id: string
  title: string
  lastActivity: Date
  messageCount: number
  threadId?: string
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
  }>
  analysisOutputs: AnalysisOutput[]
  hasUnviewedResults?: boolean
}

type ChatSessionViewProps = {
  session: ChatSession
}

export default function ChatSessionView({ session }: ChatSessionViewProps) {
  const [openTiles, setOpenTiles] = useState<{ [key: string]: boolean }>({})
  const [searchTerms, setSearchTerms] = useState<{ [outputId: string]: string }>({})
  const [currentPage, setCurrentPage] = useState<{ [outputId: string]: number }>({})
  const [selectedScenarios, setSelectedScenarios] = useState<{ [outputId: string]: number }>({})

  const toggleTile = (outputId: string) => {
    setOpenTiles(prev => ({
      ...prev,
      [outputId]: !prev[outputId]
    }))
  }

  const selectScenario = (outputId: string, scenarioIndex: number) => {
    setSelectedScenarios(prev => ({
      ...prev,
      [outputId]: scenarioIndex
    }))
  }

  const updateSearchTerm = (outputId: string, term: string) => {
    setSearchTerms(prev => ({
      ...prev,
      [outputId]: term
    }))
    // Reset to first page when searching
    setCurrentPage(prev => ({
      ...prev,
      [outputId]: 0
    }))
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

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`
  }

  const getAnalysisTypeColor = (type: string) => {
    switch (type) {
      case "scenario_analysis":
        return "bg-blue-500"
      case "distribution_analysis":
        return "bg-emerald-500"
      case "correlation_analysis":
        return "bg-purple-500"
      case "custom_analysis":
        return "bg-amber-500"
      default:
        return "bg-gray-500"
    }
  }

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case "scenario_analysis":
        return "Scenario Analysis"
      case "distribution_analysis":
        return "P&L Distribution"
      case "correlation_analysis":
        return "Correlation Analysis"
      case "custom_analysis":
        return "Custom Analysis"
      default:
        return "Analysis"
    }
  }

  // Helper function to extract currency pairs from spot moves
  const getCurrencyPairsFromScenario = (scenario: IndividualScenarioResult): string[] => {
    return Object.keys(scenario.spot_moves)
  }

  // Helper function to get Greeks by currency from scenario totals
  const getGreeksByCurrency = (scenario: IndividualScenarioResult) => {
    // Use scenario_totals for the most accurate data as per specification
    const totals = scenario.scenario_totals
    
    return {
      delta: totals.delta,  // Already by currency from scenario_totals
      gamma: totals.gamma,  // Already by currency from scenario_totals  
      vega: totals.vega,    // Total portfolio vega
      theta: totals.theta   // Total portfolio theta
    }
  }

  const formatSpotPrice = (price: number, pair: string) => {
    // JPY pairs should be displayed with 2 decimal places, others with 4
    const decimals = pair.includes("JPY") ? 2 : 4
    return price.toFixed(decimals)
  }

  const renderScenarioAnalysis = (output: AnalysisOutput) => {
    const data = output.data as BatchScenarioAnalysis
    const isOpen = openTiles[output.id] || false
    const searchTerm = searchTerms[output.id] || ""
    const page = currentPage[output.id] || 0
    const selectedScenarioIndex = selectedScenarios[output.id] || 0
    const itemsPerPage = 5

    // Filter scenarios based on search term
    const filteredScenarios = data.scenario_results.filter(scenario => 
      scenario.scenario_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.scenario_parameters.narrative.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Paginate results
    const totalPages = Math.ceil(filteredScenarios.length / itemsPerPage)
    const paginatedScenarios = filteredScenarios.slice(page * itemsPerPage, (page + 1) * itemsPerPage)

    return (
      <Collapsible key={output.id} open={isOpen} onOpenChange={() => toggleTile(output.id)}>
        <Card className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <Activity className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{output.title}</CardTitle>
                    <CardDescription>{output.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {data.summary_statistics.total_scenarios} scenarios
                  </Badge>
                  <div className="text-right text-sm">
                    <div className="font-medium">
                      Avg P&L: {formatCurrency(data.summary_statistics.pnl_statistics.avg_pnl)}
                    </div>
                    <div className="text-muted-foreground">
                      {formatDate(output.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-6">
              {/* Summary Statistics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Processing Time</div>
                  <div className="text-lg font-medium">
                    {data.summary_statistics.total_execution_time}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {data.summary_statistics.successful_scenarios} scenarios
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Best Case</div>
                  <div className="text-lg font-medium text-emerald-500">
                    {formatCurrency(data.summary_statistics.pnl_statistics.max_pnl)}
                  </div>
                  <div className="text-xs text-emerald-600">
                    {formatPercent(data.summary_statistics.pnl_statistics.max_pnl_percent)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Worst Case</div>
                  <div className="text-lg font-medium text-red-500">
                    {formatCurrency(data.summary_statistics.pnl_statistics.min_pnl)}
                  </div>
                  <div className="text-xs text-red-600">
                    {formatPercent(data.summary_statistics.pnl_statistics.min_pnl_percent)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Average</div>
                  <div className="text-lg font-medium">
                    {formatCurrency(data.summary_statistics.pnl_statistics.avg_pnl)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatPercent(data.summary_statistics.pnl_statistics.avg_pnl_percent)}
                  </div>
                </div>
              </div>

              {/* Search and Scenario Results */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium">Scenario Results</h4>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search scenarios..."
                      value={searchTerm}
                      onChange={(e) => updateSearchTerm(output.id, e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Scenario</TableHead>
                          <TableHead>Narrative</TableHead>
                          <TableHead>Key Moves</TableHead>
                          <TableHead className="text-right">P&L Impact</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedScenarios.map((scenario, index) => {
                          const absoluteIndex = page * itemsPerPage + index
                          const isSelected = selectedScenarioIndex === absoluteIndex
                          
                          return (
                            <TableRow 
                              key={index} 
                              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                isSelected ? 'bg-muted/30 border-l-2 border-l-muted-foreground/30' : ''
                              }`}
                              onClick={() => selectScenario(output.id, absoluteIndex)}
                            >
                              <TableCell className="font-medium">
                                {scenario.scenario_name}
                                {isSelected && (
                                  <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                    Selected
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <div className="text-sm text-muted-foreground">
                                  {scenario.scenario_parameters.narrative}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  {Object.entries(scenario.spot_moves).slice(0, 3).map(([pair, move]) => (
                                    <div key={pair} className="text-xs flex items-center gap-2">
                                      <span className="font-mono">{pair}</span>
                                      <span className="text-muted-foreground">
                                        {formatSpotPrice(move.original, pair)} → {formatSpotPrice(move.new, pair)}
                                      </span>
                                      <span className={move.move_percent >= 0 ? "text-emerald-600" : "text-red-600"}>
                                        ({formatPercent(move.move_percent)})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className={`font-medium ${scenario.pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                  {formatCurrency(scenario.pnl)}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {page * itemsPerPage + 1}-{Math.min((page + 1) * itemsPerPage, filteredScenarios.length)} of {filteredScenarios.length} scenarios
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => ({ ...prev, [output.id]: Math.max(0, page - 1) }))}
                        disabled={page === 0}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {page + 1} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => ({ ...prev, [output.id]: Math.min(totalPages - 1, page + 1) }))}
                        disabled={page === totalPages - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Greeks Analysis for selected scenario */}
              {data.scenario_results.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium mb-3">Risk Profile Changes (Selected: {data.scenario_results[selectedScenarioIndex]?.scenario_name || "None"})</h4>
                  
                  {/* Greeks by Currency */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium">Greeks by Currency (from scenario_totals)</h5>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Currency</TableHead>
                            <TableHead className="text-right">Delta</TableHead>
                            <TableHead className="text-right">Gamma</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.scenario_results[selectedScenarioIndex] && Object.entries(getGreeksByCurrency(data.scenario_results[selectedScenarioIndex]).delta).map(([currency, newDelta]) => {
                            const selectedScenario = data.scenario_results[selectedScenarioIndex]
                            const originalDelta = selectedScenario.original_greeks.delta[currency] || 0
                            const originalGamma = selectedScenario.original_greeks.gamma[currency] || 0
                            const newGamma = getGreeksByCurrency(selectedScenario).gamma[currency] || 0
                            
                            return (
                              <TableRow key={currency}>
                                <TableCell className="font-mono font-medium">{currency}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">{formatCurrency(originalDelta)}</span>
                                    <span className="text-sm font-medium">→ {formatCurrency(newDelta)}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">{formatCurrency(originalGamma)}</span>
                                    <span className="text-sm font-medium">→ {formatCurrency(newGamma)}</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  {/* Portfolio Totals */}
                  <div className="mt-4">
                    <h5 className="text-sm font-medium mb-2">Portfolio Totals</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded">
                        <div className="text-xs text-muted-foreground">Total Vega</div>
                        <div className="text-sm font-medium mt-1">
                          {data.scenario_results[selectedScenarioIndex] && formatCurrency(data.scenario_results[selectedScenarioIndex].original_greeks.vega)} → {data.scenario_results[selectedScenarioIndex] && formatCurrency(data.scenario_results[selectedScenarioIndex].scenario_totals.vega)}
                        </div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-xs text-muted-foreground">Total Theta</div>
                        <div className="text-sm font-medium mt-1">
                          {data.scenario_results[selectedScenarioIndex] && formatCurrency(data.scenario_results[selectedScenarioIndex].original_greeks.theta)} → {data.scenario_results[selectedScenarioIndex] && formatCurrency(data.scenario_results[selectedScenarioIndex].scenario_totals.theta)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    )
  }

  const renderOtherAnalysis = (output: AnalysisOutput) => {
    const isOpen = openTiles[output.id] || false

    return (
      <Collapsible key={output.id} open={isOpen} onOpenChange={() => toggleTile(output.id)}>
        <Card className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{output.title}</CardTitle>
                    <CardDescription>{output.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={getAnalysisTypeColor(output.type)}>
                    {getAnalysisTypeLabel(output.type)}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(output.createdAt)}
                  </div>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Analysis data structure for {output.type} will be implemented based on specific requirements.
                </div>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                  {JSON.stringify(output.data, null, 2)}
                </pre>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    )
  }

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{session.title}</h2>
            <p className="text-muted-foreground">Session analysis results and outputs</p>
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

      {/* Analysis Outputs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Analysis Results</h3>
            <div className="text-sm text-muted-foreground">
              {session.analysisOutputs.length} output{session.analysisOutputs.length !== 1 ? "s" : ""} generated
            </div>
          </div>

          {session.analysisOutputs.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-2">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h4 className="text-lg font-medium">No Analysis Results Yet</h4>
                  <p className="text-muted-foreground">
                    Continue chatting to generate scenario analysis and other insights
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {session.analysisOutputs.map((output) => {
                if (output.type === "scenario_analysis") {
                  return renderScenarioAnalysis(output)
                } else {
                  return renderOtherAnalysis(output)
                }
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
