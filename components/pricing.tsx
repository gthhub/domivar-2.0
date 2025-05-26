"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Type for a pricing row
type PricingRow = {
  id: string
  currency: string
  type: "call" | "put"
  expiry: Date | undefined
  strike: string
}

// Type for a priced option result
type PricedOption = {
  id: string
  currency: string
  type: "call" | "put"
  expiry: string
  strike: string
  value: number
  delta: number
  gamma: number
  vega: number
  theta: number
  timestamp: Date
  source: "pricer" | "chat"
}

export default function Pricing() {
  // State for pricing rows
  const [pricingRows, setPricingRows] = useState<PricingRow[]>([
    {
      id: "1",
      currency: "eurusd",
      type: "call",
      expiry: undefined,
      strike: "1.0900",
    },
  ])

  // State for recent pricings
  const [recentPricings, setRecentPricings] = useState<PricedOption[]>([
    {
      id: "1",
      currency: "EUR/USD",
      type: "call",
      expiry: "2023-06-15",
      strike: "1.0900",
      value: 0.0082,
      delta: 0.45,
      gamma: 0.12,
      vega: 0.0015,
      theta: -0.0008,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      source: "pricer",
    },
    {
      id: "2",
      currency: "USD/JPY",
      type: "put",
      expiry: "2023-07-20",
      strike: "142.50",
      value: 0.0065,
      delta: -0.38,
      gamma: 0.09,
      vega: 0.0012,
      theta: -0.0006,
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      source: "chat",
    },
    {
      id: "3",
      currency: "GBP/USD",
      type: "call",
      expiry: "2023-08-10",
      strike: "1.2650",
      value: 0.0095,
      delta: 0.52,
      gamma: 0.14,
      vega: 0.0018,
      theta: -0.0009,
      timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
      source: "pricer",
    },
  ])

  // Add a new pricing row
  const addPricingRow = () => {
    setPricingRows([
      ...pricingRows,
      {
        id: Date.now().toString(),
        currency: "eurusd",
        type: "call",
        expiry: undefined,
        strike: "1.0900",
      },
    ])
  }

  // Remove a pricing row
  const removePricingRow = (id: string) => {
    setPricingRows(pricingRows.filter((row) => row.id !== id))
  }

  // Update a pricing row
  const updatePricingRow = (id: string, field: keyof PricingRow, value: any) => {
    setPricingRows(
      pricingRows.map((row) => {
        if (row.id === id) {
          return { ...row, [field]: value }
        }
        return row
      }),
    )
  }

  // Price the options
  const priceOptions = () => {
    const newPricings = pricingRows.map((row) => {
      // Generate random values for demo purposes
      const value = Number.parseFloat((Math.random() * 0.02).toFixed(4))
      const delta =
        row.type === "call"
          ? Number.parseFloat((Math.random() * 0.6).toFixed(2))
          : Number.parseFloat((-Math.random() * 0.6).toFixed(2))
      const gamma = Number.parseFloat((Math.random() * 0.2).toFixed(2))
      const vega = Number.parseFloat((Math.random() * 0.003).toFixed(4))
      const theta = Number.parseFloat((-Math.random() * 0.001).toFixed(4))

      return {
        id: Date.now().toString() + row.id,
        currency: getCurrencyLabel(row.currency),
        type: row.type,
        expiry: row.expiry ? format(row.expiry, "yyyy-MM-dd") : "2023-06-30",
        strike: row.strike,
        value,
        delta,
        gamma,
        vega,
        theta,
        timestamp: new Date(),
        source: "pricer" as const,
      }
    })

    setRecentPricings([...newPricings, ...recentPricings])
  }

  // Helper function to get currency label
  const getCurrencyLabel = (value: string): string => {
    const map: { [key: string]: string } = {
      eurusd: "EUR/USD",
      usdjpy: "USD/JPY",
      gbpusd: "GBP/USD",
      audusd: "AUD/USD",
      usdcad: "USD/CAD",
      eurgbp: "EUR/GBP",
    }
    return map[value] || value
  }

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? "s" : ""} ago`
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60)
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">FX Options Pricing</h2>
          <p className="text-muted-foreground">Price multiple FX options with custom parameters</p>
        </div>
        <Button onClick={addPricingRow}>
          <Plus className="mr-2 h-4 w-4" />
          Add Option
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Option Parameters</CardTitle>
          <CardDescription>Configure parameters for each option you want to price</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pricingRows.map((row, index) => (
              <div key={row.id} className="flex items-end gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="space-y-2 flex-1">
                  <Label htmlFor={`currency-${row.id}`}>Currency Pair</Label>
                  <Select value={row.currency} onValueChange={(value) => updatePricingRow(row.id, "currency", value)}>
                    <SelectTrigger id={`currency-${row.id}`}>
                      <SelectValue placeholder="Select currency pair" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eurusd">EUR/USD</SelectItem>
                      <SelectItem value="usdjpy">USD/JPY</SelectItem>
                      <SelectItem value="gbpusd">GBP/USD</SelectItem>
                      <SelectItem value="audusd">AUD/USD</SelectItem>
                      <SelectItem value="usdcad">USD/CAD</SelectItem>
                      <SelectItem value="eurgbp">EUR/GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 w-32">
                  <Label htmlFor={`type-${row.id}`}>Contract</Label>
                  <Select
                    value={row.type}
                    onValueChange={(value) => updatePricingRow(row.id, "type", value as "call" | "put")}
                  >
                    <SelectTrigger id={`type-${row.id}`}>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="put">Put</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex-1">
                  <Label htmlFor={`expiry-${row.id}`}>Expiry</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id={`expiry-${row.id}`}
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {row.expiry ? format(row.expiry, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={row.expiry}
                        onSelect={(date) => updatePricingRow(row.id, "expiry", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2 flex-1">
                  <Label htmlFor={`strike-${row.id}`}>Strike</Label>
                  <Input
                    id={`strike-${row.id}`}
                    value={row.strike}
                    onChange={(e) => updatePricingRow(row.id, "strike", e.target.value)}
                    type="number"
                    step="0.0001"
                  />
                </div>

                {pricingRows.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePricingRow(row.id)}
                    className="mb-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="flex justify-end">
              <Button onClick={priceOptions}>Price Options</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Pricings</CardTitle>
          <CardDescription>Options recently priced via the pricer or chat</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Strike</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Delta</TableHead>
                <TableHead className="text-right">Gamma</TableHead>
                <TableHead className="text-right">Vega</TableHead>
                <TableHead className="text-right">Theta</TableHead>
                <TableHead className="text-right">Source</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPricings.map((option) => (
                <TableRow key={option.id}>
                  <TableCell className="font-medium">{option.currency}</TableCell>
                  <TableCell>
                    <Badge variant={option.type === "call" ? "default" : "secondary"}>
                      {option.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(option.expiry).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{option.strike}</TableCell>
                  <TableCell className="text-right">{option.value.toFixed(4)}</TableCell>
                  <TableCell className={`text-right ${option.delta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {option.delta.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{option.gamma.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{option.vega.toFixed(4)}</TableCell>
                  <TableCell className={`text-right ${option.theta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {option.theta.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">{option.source}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {formatTimestamp(option.timestamp)}
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
