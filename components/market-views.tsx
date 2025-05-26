import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, Clock, Edit, MessageSquare } from "lucide-react"

export default function MarketViews() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Market Views</h2>
          <p className="text-muted-foreground">
            Macroeconomic and directional views I've gathered from our conversations over time.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Edit className="h-4 w-4" />
          Update Views
        </Button>
      </div>

      <Tabs defaultValue="directional" className="space-y-4">
        <TabsList>
          <TabsTrigger value="directional">Directional Views</TabsTrigger>
          <TabsTrigger value="macro">Macroeconomic Views</TabsTrigger>
          <TabsTrigger value="central-banks">Central Bank Views</TabsTrigger>
        </TabsList>

        <TabsContent value="directional" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Short-Term Views (1-4 weeks)</CardTitle>
                  <Badge variant="outline" className="font-normal">
                    <Clock className="mr-1 h-3 w-3" />
                    Updated 2 days ago
                  </Badge>
                </div>
                <CardDescription>Your short-term directional bias on currency pairs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge className="bg-emerald-500 mr-2">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Bullish
                      </Badge>
                      <span className="font-medium">EUR/USD</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>From conversation on May 8</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "I expect EUR to strengthen against USD in the coming weeks due to the ECB's hawkish stance compared
                    to the Fed's potential pause."
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge className="bg-red-500 mr-2">
                        <ArrowDown className="h-3 w-3 mr-1" />
                        Bearish
                      </Badge>
                      <span className="font-medium">USD/JPY</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>From conversation on May 10</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "I believe USD/JPY will decline in the short term as the Bank of Japan may signal policy
                    normalization sooner than the market expects."
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="ml-auto">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Views
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Medium-Term Views (1-3 months)</CardTitle>
                  <Badge variant="outline" className="font-normal">
                    <Clock className="mr-1 h-3 w-3" />
                    Updated 5 days ago
                  </Badge>
                </div>
                <CardDescription>Your medium-term directional bias on currency pairs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge className="bg-emerald-500 mr-2">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Bullish
                      </Badge>
                      <span className="font-medium">GBP/USD</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>From conversation on May 5</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "I'm bullish on GBP/USD for the next quarter as UK economic data has been surprisingly resilient,
                    and the BoE is likely to maintain higher rates for longer than the Fed."
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge className="bg-emerald-500 mr-2">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Bullish
                      </Badge>
                      <span className="font-medium">AUD/JPY</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>From conversation on May 7</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "I expect AUD/JPY to perform well over the next few months as Chinese stimulus measures should
                    support Australian exports, while the yen remains under pressure."
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="ml-auto">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Views
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Long-Term Views (3+ months)</CardTitle>
                  <Badge variant="outline" className="font-normal">
                    <Clock className="mr-1 h-3 w-3" />
                    Updated 1 week ago
                  </Badge>
                </div>
                <CardDescription>Your long-term directional bias on currency pairs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge className="bg-red-500 mr-2">
                        <ArrowDown className="h-3 w-3 mr-1" />
                        Bearish
                      </Badge>
                      <span className="font-medium">EUR/GBP</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>From conversation on May 3</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "I have a long-term bearish view on EUR/GBP as I believe the UK economy will outperform the Eurozone
                    over the next 6-12 months, especially in terms of growth and inflation control."
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="ml-auto">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Views
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Volatility Expectations</CardTitle>
                <CardDescription>Your views on FX market volatility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">EUR/USD Volatility</span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>From conversation on May 9</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "I expect EUR/USD implied volatility to increase in the coming months as we approach the ECB's
                    potential rate hike decision and the Fed's policy pivot."
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">G10 FX Volatility Regime</span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>From conversation on May 4</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "I believe we're entering a higher volatility regime for G10 FX over the next quarter as central
                    bank divergence becomes more pronounced."
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="ml-auto">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Views
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="macro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Economic Outlook</CardTitle>
              <CardDescription>Your views on global economic conditions affecting FX markets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">US Economic Growth</span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>From conversation on May 6</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  "I expect US economic growth to slow in the second half of 2023, which should lead to a weaker USD
                  against most major currencies as the Fed becomes more dovish."
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">European Inflation Outlook</span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>From conversation on May 8</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  "I believe European inflation will remain sticky, forcing the ECB to maintain a hawkish stance longer
                  than markets currently expect, which should support the EUR."
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Chinese Recovery</span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>From conversation on May 2</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  "I'm skeptical about the strength of China's economic recovery, which could weigh on commodity
                  currencies like AUD and NZD in the medium term."
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="ml-auto">
                <Edit className="h-4 w-4 mr-2" />
                Edit Views
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="central-banks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Central Bank Policy Expectations</CardTitle>
              <CardDescription>Your views on central bank policies affecting FX markets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Federal Reserve</span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>From conversation on May 11</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  "I expect the Fed to pause rate hikes in June and potentially signal rate cuts by Q4 2023, which would
                  weaken the USD against most major currencies."
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">European Central Bank</span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>From conversation on May 9</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  "I believe the ECB will continue hiking rates through Q3 2023, maintaining a more hawkish stance than
                  the Fed, which should support EUR/USD."
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Bank of Japan</span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>From conversation on May 7</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  "I expect the BoJ to adjust its yield curve control policy by Q3 2023, which would lead to significant
                  JPY strength against most currencies."
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Bank of England</span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>From conversation on May 5</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  "I think the BoE will hike rates one more time and then hold for an extended period, which should
                  provide moderate support for GBP."
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="ml-auto">
                <Edit className="h-4 w-4 mr-2" />
                Edit Views
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
