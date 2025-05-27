"use client"

import { useState } from "react"
import { ArrowUp, Calendar, DollarSign, Info, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Sample data for FX Options with added Greeks
const positions = [
  {
    id: "1",
    currencyPair: "EUR/USD",
    type: "Call Option",
    strike: 1.085,
    spotRate: 1.0825,
    expiration: "2023-06-15",
    notional: "€5,000,000",
    premium: 125000,
    currentValue: 187500,
    pnl: 62500,
    delta: 325000,
    gamma: 28500,
    vega: 15200,
    theta: -4200,
  },
  {
    id: "2",
    currencyPair: "GBP/JPY",
    type: "Put Option",
    strike: 175.5,
    spotRate: 176.25,
    expiration: "2023-06-30",
    notional: "£3,000,000",
    premium: 98000,
    currentValue: 78400,
    pnl: -19600,
    delta: -185000,
    gamma: 12000,
    vega: 9500,
    theta: -2800,
  },
  {
    id: "3",
    currencyPair: "USD/JPY",
    type: "Call Option",
    strike: 142.0,
    spotRate: 143.75,
    expiration: "2023-07-15",
    notional: "$7,000,000",
    premium: 154000,
    currentValue: 231000,
    pnl: 77000,
    delta: 420000,
    gamma: -8500,
    vega: 22000,
    theta: -6500,
  },
  {
    id: "4",
    currencyPair: "AUD/USD",
    type: "Put Option",
    strike: 0.665,
    spotRate: 0.6625,
    expiration: "2023-06-15",
    notional: "A$4,000,000",
    premium: 88000,
    currentValue: 117000,
    pnl: 29000,
    delta: -125000,
    gamma: 8500,
    vega: 5800,
    theta: -1800,
  },
  {
    id: "5",
    currencyPair: "EUR/GBP",
    type: "Call Option",
    strike: 0.855,
    spotRate: 0.8575,
    expiration: "2023-07-30",
    notional: "€6,000,000",
    premium: 132000,
    currentValue: 184800,
    pnl: 52800,
    delta: 180000,
    gamma: 9500,
    vega: 12500,
    theta: -3200,
  },
]

// Sample data for risk summary (Greeks by currency pair)
const riskSummary = [
  {
    currencyPair: "EUR/USD",
    delta: 1250000,
    gamma: 85000,
    vega: 45000,
    theta: -12500,
  },
  {
    currencyPair: "GBP/JPY",
    delta: -750000,
    gamma: 32000,
    vega: 28000,
    theta: -8500,
  },
  {
    currencyPair: "USD/JPY",
    delta: 950000,
    gamma: -15000,
    vega: 65000,
    theta: -18000,
  },
  {
    currencyPair: "AUD/USD",
    delta: -450000,
    gamma: 22000,
    vega: 15000,
    theta: -5200,
  },
  {
    currencyPair: "EUR/GBP",
    delta: 320000,
    gamma: 18000,
    vega: 22000,
    theta: -7800,
  },
  {
    currencyPair: "GBP/USD",
    delta: 580000,
    gamma: 25000,
    vega: 18000,
    theta: -9500,
  },
]

export default function PortfolioSummary() {
  const [sortColumn, setSortColumn] = useState("currencyPair")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedPositions = [...positions].sort((a: any, b: any) => {
    if (sortDirection === "asc") {
      return a[sortColumn] > b[sortColumn] ? 1 : -1
    } else {
      return a[sortColumn] < b[sortColumn] ? 1 : -1
    }
  })

  // Format number with commas and sign
  const formatNumber = (num: number) => {
    const prefix = num >= 0 ? "+" : ""
    return `${prefix}${num.toLocaleString()}`
  }

  // Format USD value with $ sign
  const formatUSD = (num: number) => {
    const prefix = num >= 0 ? "+$" : "-$"
    return `${prefix}${Math.abs(num).toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,370,000</div>
            <p className="text-xs text-muted-foreground">+2.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">+$15,000</div>
            <p className="text-xs text-muted-foreground">+1.1% today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">+$120,000</div>
            <p className="text-xs text-muted-foreground">+9.6% all time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net USD Vega</CardTitle>
            <ArrowUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+45k</div>
            <p className="text-xs text-muted-foreground">Parallel</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Summary Section - Replacing the Performance Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Risk Summary</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delta: Sensitivity to price changes</p>
                    <p>Gamma: Rate of change of Delta</p>
                    <p>Vega: Sensitivity to volatility changes</p>
                    <p>Theta: Time decay per day</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currencies</SelectItem>
                <SelectItem value="usd">USD Exposure</SelectItem>
                <SelectItem value="eur">EUR Exposure</SelectItem>
                <SelectItem value="gbp">GBP Exposure</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>Key risk metrics by currency pair</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {riskSummary.map((item) => (
              <Card key={item.currencyPair} className="overflow-hidden">
                <CardHeader className="bg-muted/50 p-4 pb-2">
                  <CardTitle className="text-base">{item.currencyPair}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Delta</p>
                      <p className={`text-sm font-medium ${item.delta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {formatNumber(item.delta)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gamma</p>
                      <p className={`text-sm font-medium ${item.gamma >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {formatNumber(item.gamma)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Vega</p>
                      <p className={`text-sm font-medium ${item.vega >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {formatNumber(item.vega)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Theta</p>
                      <p className={`text-sm font-medium ${item.theta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {formatNumber(item.theta)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>FX Options Positions</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Greek values are shown in USD</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="call">Call Options</SelectItem>
                  <SelectItem value="put">Put Options</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Filter by Date
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("currencyPair")}>
                  Currency Pair
                  {sortColumn === "currencyPair" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("type")}>
                  Type
                  {sortColumn === "type" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("strike")}>
                  Strike
                  {sortColumn === "strike" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("spotRate")}>
                  Spot
                  {sortColumn === "spotRate" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("expiration")}>
                  Expiry
                  {sortColumn === "expiration" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("notional")}>
                  Notional
                  {sortColumn === "notional" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => handleSort("delta")}>
                  Delta
                  {sortColumn === "delta" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => handleSort("gamma")}>
                  Gamma
                  {sortColumn === "gamma" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => handleSort("vega")}>
                  Vega
                  {sortColumn === "vega" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => handleSort("theta")}>
                  Theta
                  {sortColumn === "theta" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => handleSort("pnl")}>
                  P&L
                  {sortColumn === "pnl" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPositions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">{position.currencyPair}</TableCell>
                  <TableCell>{position.type}</TableCell>
                  <TableCell>{position.strike.toFixed(4)}</TableCell>
                  <TableCell>{position.spotRate.toFixed(4)}</TableCell>
                  <TableCell>
                    {new Date(position.expiration).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{position.notional}</TableCell>
                  <TableCell className={`text-right ${position.delta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {formatUSD(position.delta)}
                  </TableCell>
                  <TableCell className={`text-right ${position.gamma >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {formatUSD(position.gamma)}
                  </TableCell>
                  <TableCell className={`text-right ${position.vega >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {formatUSD(position.vega)}
                  </TableCell>
                  <TableCell className={`text-right ${position.theta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {formatUSD(position.theta)}
                  </TableCell>
                  <TableCell className={`text-right ${position.pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    <div className="flex items-center justify-end">
                      {position.pnl >= 0 ? (
                        <TrendingUp className="mr-1 h-4 w-4" />
                      ) : (
                        <TrendingDown className="mr-1 h-4 w-4" />
                      )}
                      ${Math.abs(position.pnl).toLocaleString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
