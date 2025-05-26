import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ActiveConvictions() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Active FX Convictions</h2>
      <p className="text-muted-foreground">
        Current trading ideas and convictions for FX options based on market analysis and AI insights.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Current Trading Ideas</CardTitle>
          <CardDescription>Active convictions for the next 1-3 months</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency Pair</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Timeframe</TableHead>
                <TableHead>Conviction</TableHead>
                <TableHead>Rationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">EUR/USD</TableCell>
                <TableCell>Risk Reversal</TableCell>
                <TableCell>
                  <Badge className="bg-emerald-500">Bullish EUR</Badge>
                </TableCell>
                <TableCell>3 Months</TableCell>
                <TableCell>High</TableCell>
                <TableCell>ECB hawkish pivot vs Fed easing cycle</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">USD/JPY</TableCell>
                <TableCell>Put Spread</TableCell>
                <TableCell>
                  <Badge className="bg-red-500">Bearish USD</Badge>
                </TableCell>
                <TableCell>1 Month</TableCell>
                <TableCell>Medium</TableCell>
                <TableCell>BoJ policy normalization expectations</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">GBP/USD</TableCell>
                <TableCell>Call Option</TableCell>
                <TableCell>
                  <Badge className="bg-emerald-500">Bullish GBP</Badge>
                </TableCell>
                <TableCell>2 Months</TableCell>
                <TableCell>Medium</TableCell>
                <TableCell>UK economic resilience vs US slowdown</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">AUD/USD</TableCell>
                <TableCell>Strangle</TableCell>
                <TableCell>
                  <Badge variant="outline">Volatility Play</Badge>
                </TableCell>
                <TableCell>1 Month</TableCell>
                <TableCell>High</TableCell>
                <TableCell>RBA meeting and China economic data</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">EUR/GBP</TableCell>
                <TableCell>Put Option</TableCell>
                <TableCell>
                  <Badge className="bg-red-500">Bearish EUR</Badge>
                </TableCell>
                <TableCell>3 Months</TableCell>
                <TableCell>Low</TableCell>
                <TableCell>Divergent economic performance</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Insights</CardTitle>
          <CardDescription>Recent AI analysis of FX market conditions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border p-4">
            <h3 className="text-lg font-medium">EUR/USD Volatility Surface Analysis</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The current volatility surface for EUR/USD shows a significant skew toward EUR calls, suggesting market
              participants are positioning for potential EUR strength. The 3-month 25-delta risk reversal has moved from
              -0.3 to +0.5 over the past two weeks, indicating a shift in sentiment.
            </p>
          </div>
          <div className="rounded-md border p-4">
            <h3 className="text-lg font-medium">G10 Carry Trade Opportunities</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Analysis of implied forward points and interest rate differentials suggests potential opportunities in
              AUD/JPY and NZD/CHF carry trades. Options strategies to enhance carry while limiting downside risk include
              out-of-the-money put spreads.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
