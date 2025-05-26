import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ChatOutputs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Chat Outputs</h2>
      <p className="text-muted-foreground">Custom analysis outputs from your AI assistant conversations</p>

      <Tabs defaultValue="distributions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distributions">PnL Distributions</TabsTrigger>
          <TabsTrigger value="scenarios">Custom Scenarios</TabsTrigger>
          <TabsTrigger value="analysis">Stress Shocks</TabsTrigger>
          <TabsTrigger value="other">Other Outputs</TabsTrigger>
        </TabsList>

        <TabsContent value="distributions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>EUR/USD PnL Distribution (1 Month)</CardTitle>
              <CardDescription>Generated on May 13, 2023 from chat conversation</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This probability distribution chart shows the potential P&L outcomes for your EUR/USD positions over
                    the next month based on historical volatility patterns and current market conditions.
                  </p>

                  <div className="h-64 w-full bg-muted/30 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">PnL Distribution Chart Placeholder</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Statistics:</h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        <span className="font-medium">Expected P&L:</span> +$42,500
                      </li>
                      <li>
                        <span className="font-medium">95% Confidence Interval:</span> -$28,000 to +$115,000
                      </li>
                      <li>
                        <span className="font-medium">Maximum Loss (99% confidence):</span> -$52,000
                      </li>
                      <li>
                        <span className="font-medium">Probability of Profit:</span> 68%
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Analysis:</h4>
                    <p className="text-sm text-muted-foreground">
                      The distribution shows a positive skew, indicating a higher probability of moderate gains versus
                      losses. The long right tail suggests potential for significant upside in specific market
                      scenarios. Your current position has a 68% probability of being profitable at the 1-month horizon.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Key risk factors include the upcoming ECB meeting (May 25) and US inflation data release (May 18),
                      which could significantly impact the distribution.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multivariate Scenario Analysis</CardTitle>
              <CardDescription>Generated on May 12, 2023 from chat conversation</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This custom scenario analysis examines portfolio performance across multiple variables: Fed policy
                    shifts, ECB actions, and global risk sentiment.
                  </p>

                  <div className="h-64 w-full bg-muted/30 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Multivariate Scenario Chart Placeholder</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Scenario Outcomes:</h4>
                    <div className="space-y-3">
                      <div className="rounded-md border p-3">
                        <h5 className="font-medium text-emerald-500">Best Case: +$185,000</h5>
                        <p className="text-sm text-muted-foreground">
                          Fed pause + ECB hawkish surprise + Risk-on sentiment
                        </p>
                      </div>
                      <div className="rounded-md border p-3">
                        <h5 className="font-medium text-amber-500">Base Case: +$42,000</h5>
                        <p className="text-sm text-muted-foreground">
                          Fed pause + ECB as expected + Neutral risk sentiment
                        </p>
                      </div>
                      <div className="rounded-md border p-3">
                        <h5 className="font-medium text-red-500">Worst Case: -$98,000</h5>
                        <p className="text-sm text-muted-foreground">
                          Fed hawkish surprise + ECB dovish + Risk-off sentiment
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recommendations:</h4>
                    <p className="text-sm text-muted-foreground">
                      Consider hedging against the "Fed hawkish surprise" scenario, which represents the largest risk to
                      your current portfolio. A USD/JPY put option could provide effective protection while maintaining
                      upside exposure to your core EUR/USD position.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Stress Test</CardTitle>
              <CardDescription>Generated on May 10, 2023 from chat conversation</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This stress test evaluates your portfolio performance under historical crisis scenarios.
                  </p>

                  <div className="space-y-3">
                    <div className="rounded-md border p-3">
                      <h5 className="font-medium">2022 Fed Hawkish Pivot</h5>
                      <p className="text-sm text-muted-foreground">Portfolio Impact: -$78,500</p>
                    </div>
                    <div className="rounded-md border p-3">
                      <h5 className="font-medium">2020 COVID Market Crash</h5>
                      <p className="text-sm text-muted-foreground">Portfolio Impact: -$145,000</p>
                    </div>
                    <div className="rounded-md border p-3">
                      <h5 className="font-medium">2016 Brexit Vote</h5>
                      <p className="text-sm text-muted-foreground">Portfolio Impact: +$62,000</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Vulnerability Analysis:</h4>
                    <p className="text-sm text-muted-foreground">
                      Your portfolio shows particular sensitivity to rapid USD strengthening scenarios and volatility
                      spikes. The positive performance during Brexit-like events suggests resilience to GBP-specific
                      shocks.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Correlation Analysis</CardTitle>
              <CardDescription>Generated on May 9, 2023 from chat conversation</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Analysis of changing correlations between your key currency pairs and their impact on portfolio
                    diversification.
                  </p>

                  <div className="h-64 w-full bg-muted/30 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Correlation Matrix Placeholder</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Insights:</h4>
                    <p className="text-sm text-muted-foreground">
                      The correlation between EUR/USD and GBP/USD has increased from 0.65 to 0.82 over the past month,
                      reducing the diversification benefit of holding both positions. Consider adjusting position sizes
                      to account for this increased correlation.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
