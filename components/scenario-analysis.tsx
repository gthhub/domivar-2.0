import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ScenarioAnalysis() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">FX Options Scenario Analysis</h2>
      <p className="text-muted-foreground">
        Analyze how different market scenarios would impact your FX options portfolio.
      </p>

      <div className="flex items-center gap-4">
        <Select defaultValue="eurusd">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Currency Pair" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="eurusd">EUR/USD</SelectItem>
            <SelectItem value="usdjpy">USD/JPY</SelectItem>
            <SelectItem value="gbpusd">GBP/USD</SelectItem>
            <SelectItem value="audusd">AUD/USD</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="1m">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1w">1 Week</SelectItem>
            <SelectItem value="1m">1 Month</SelectItem>
            <SelectItem value="3m">3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="price" className="space-y-4">
        <TabsList>
          <TabsTrigger value="price">Price Scenarios</TabsTrigger>
          <TabsTrigger value="volatility">Vol Scenarios</TabsTrigger>
          <TabsTrigger value="pricevol">Price + Vol</TabsTrigger>
          <TabsTrigger value="correlation">Correlation Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="price" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>EUR/USD Price Scenario Analysis</CardTitle>
              <CardDescription>Impact on portfolio based on different price movements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scenario</TableHead>
                    <TableHead>Price Change</TableHead>
                    <TableHead>New Spot Rate</TableHead>
                    <TableHead>Portfolio Impact</TableHead>
                    <TableHead className="text-right">P&L Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Significant USD Strength</TableCell>
                    <TableCell>-3%</TableCell>
                    <TableCell>1.0500</TableCell>
                    <TableCell>Negative</TableCell>
                    <TableCell className="text-right text-red-500">-$42,500</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Moderate USD Strength</TableCell>
                    <TableCell>-1%</TableCell>
                    <TableCell>1.0717</TableCell>
                    <TableCell>Slightly Negative</TableCell>
                    <TableCell className="text-right text-red-500">-$15,200</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">No Change</TableCell>
                    <TableCell>0%</TableCell>
                    <TableCell>1.0825</TableCell>
                    <TableCell>Neutral</TableCell>
                    <TableCell className="text-right">$0</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Moderate USD Weakness</TableCell>
                    <TableCell>+1%</TableCell>
                    <TableCell>1.0933</TableCell>
                    <TableCell>Slightly Positive</TableCell>
                    <TableCell className="text-right text-emerald-500">+$18,700</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Significant USD Weakness</TableCell>
                    <TableCell>+3%</TableCell>
                    <TableCell>1.1150</TableCell>
                    <TableCell>Positive</TableCell>
                    <TableCell className="text-right text-emerald-500">+$57,300</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volatility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Volatility Scenario Analysis</CardTitle>
              <CardDescription>Impact on portfolio based on volatility changes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This analysis shows how changes in implied volatility would affect your EUR/USD options positions.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scenario</TableHead>
                    <TableHead>Volatility Change</TableHead>
                    <TableHead>New Implied Vol</TableHead>
                    <TableHead>Portfolio Impact</TableHead>
                    <TableHead className="text-right">P&L Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Volatility Crash</TableCell>
                    <TableCell>-30%</TableCell>
                    <TableCell>5.6%</TableCell>
                    <TableCell>Highly Negative</TableCell>
                    <TableCell className="text-right text-red-500">-$68,200</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Volatility Decrease</TableCell>
                    <TableCell>-10%</TableCell>
                    <TableCell>7.2%</TableCell>
                    <TableCell>Negative</TableCell>
                    <TableCell className="text-right text-red-500">-$22,500</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">No Change</TableCell>
                    <TableCell>0%</TableCell>
                    <TableCell>8.0%</TableCell>
                    <TableCell>Neutral</TableCell>
                    <TableCell className="text-right">$0</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Volatility Increase</TableCell>
                    <TableCell>+10%</TableCell>
                    <TableCell>8.8%</TableCell>
                    <TableCell>Positive</TableCell>
                    <TableCell className="text-right text-emerald-500">+$24,100</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Volatility Spike</TableCell>
                    <TableCell>+30%</TableCell>
                    <TableCell>10.4%</TableCell>
                    <TableCell>Highly Positive</TableCell>
                    <TableCell className="text-right text-emerald-500">+$75,600</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricevol" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Combined Price & Volatility Scenario Analysis</CardTitle>
              <CardDescription>Impact on portfolio based on simultaneous price and volatility changes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This analysis shows how combined changes in price and implied volatility would affect your EUR/USD
                options positions.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scenario</TableHead>
                    <TableHead>Price Change</TableHead>
                    <TableHead>Vol Change</TableHead>
                    <TableHead>Portfolio Impact</TableHead>
                    <TableHead className="text-right">P&L Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Risk-Off (USD+, Vol+)</TableCell>
                    <TableCell>-2%</TableCell>
                    <TableCell>+20%</TableCell>
                    <TableCell>Mixed</TableCell>
                    <TableCell className="text-right text-emerald-500">+$12,300</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Risk-On (USD-, Vol-)</TableCell>
                    <TableCell>+2%</TableCell>
                    <TableCell>-15%</TableCell>
                    <TableCell>Mixed</TableCell>
                    <TableCell className="text-right text-red-500">-$8,700</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">USD Crash (USD-, Vol+)</TableCell>
                    <TableCell>+3%</TableCell>
                    <TableCell>+25%</TableCell>
                    <TableCell>Highly Positive</TableCell>
                    <TableCell className="text-right text-emerald-500">+$103,500</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">USD Rally (USD+, Vol+)</TableCell>
                    <TableCell>-3%</TableCell>
                    <TableCell>+25%</TableCell>
                    <TableCell>Mixed</TableCell>
                    <TableCell className="text-right text-red-500">-$15,800</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Low Volatility Range (USD=, Vol-)</TableCell>
                    <TableCell>±0.5%</TableCell>
                    <TableCell>-20%</TableCell>
                    <TableCell>Negative</TableCell>
                    <TableCell className="text-right text-red-500">-$42,600</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Correlation Impact Analysis</CardTitle>
              <CardDescription>How correlations between currency pairs affect your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                This analysis examines how changes in correlations between major currency pairs would impact your
                overall portfolio risk and return profile.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
