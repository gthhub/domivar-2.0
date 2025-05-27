import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, Clock, Edit, MessageSquare, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react"
import { useMarketViews, MarketView, MacroView } from "./market-views-context"
import { useEffect, useRef, useState } from "react"

export default function MarketViewsDynamic({ threadId }: { threadId?: string }) {
  const { marketViews, refreshMarketViews, isRefreshing } = useMarketViews()
  const hasAutoRefreshed = useRef(false)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false)

  // Auto-refresh ONLY when component mounts (when tab is navigated to)
  useEffect(() => {
    const initializeMarketViews = async () => {
      if (hasAutoRefreshed.current) return

      console.log('Initializing market views...')
      setIsAutoRefreshing(true)
      
      try {
        // Try with provided threadId first, or let API find/create one with data
        const url = threadId ? `/api/graph-state?threadId=${threadId}` : '/api/graph-state'
        const response = await fetch(url)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Graph state response:', data)
          console.log('Market views in response:', data.graph_state?.market_views)
          console.log('Market views count:', data.graph_state?.market_views ? Object.keys(data.graph_state.market_views).length : 0)
          
          if (data.success && data.graph_state) {
            // Check if we have any market views data
            const hasMarketViews = data.graph_state.market_views && Object.keys(data.graph_state.market_views).length > 0
            
            if (hasMarketViews) {
              console.log('Found market views, updating context')
              await refreshMarketViews(data.thread_id)
            } else {
              console.log('No market views found - this may be a new user or system')
            }
            
            hasAutoRefreshed.current = true
            
            if (data.created_new_thread) {
              console.log('API created/found thread for market views:', data.thread_id)
            }
          }
        } else {
          console.log('Could not fetch graph state:', response.status)
        }
      } catch (error) {
        console.log('Could not initialize market views:', error)
      } finally {
        setIsAutoRefreshing(false)
      }
    }

    initializeMarketViews()
  }, []) // Empty dependency array - only runs on mount

  const handleRefresh = async () => {
    if (threadId) {
      const success = await refreshMarketViews(threadId)
      if (!success) {
        console.error('Failed to refresh market views')
        // You could add a toast notification here
      }
    } else {
      console.log('No thread ID available for refresh')
      // You could show a message to the user here
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "just now"
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'bullish':
        return <ArrowUp className="h-3 w-3 mr-1" />
      case 'bearish':
        return <ArrowDown className="h-3 w-3 mr-1" />
      default:
        return <Minus className="h-3 w-3 mr-1" />
    }
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'bullish':
        return "bg-emerald-500"
      case 'bearish':
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getOutlookIcon = (outlook: string) => {
    switch (outlook) {
      case 'positive':
        return <TrendingUp className="h-3 w-3 mr-1" />
      case 'negative':
        return <TrendingDown className="h-3 w-3 mr-1" />
      default:
        return <Minus className="h-3 w-3 mr-1" />
    }
  }

  const getOutlookColor = (outlook: string) => {
    switch (outlook) {
      case 'positive':
        return "bg-emerald-500"
      case 'negative':
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const groupViewsByTimeframe = (views: MarketView[]) => {
    return {
      'short-term': views.filter(v => v.timeframe === 'short-term'),
      'medium-term': views.filter(v => v.timeframe === 'medium-term'),
      'long-term': views.filter(v => v.timeframe === 'long-term')
    }
  }

  const groupViewsByInstrument = (views: MarketView[]) => {
    return {
      'vol': views.filter(v => 
        v.currencyPair.toLowerCase().includes('vol') ||
        v.id.toLowerCase().includes('_vol_') ||
        v.reasoning.toLowerCase().includes('volatility') ||
        v.reasoning.toLowerCase().includes('implied vol') ||
        v.reasoning.toLowerCase().includes('vol is') ||
        v.reasoning.toLowerCase().includes('vol will') ||
        v.reasoning.toLowerCase().includes('vol going')
      ),
      'surface': views.filter(v => 
        v.currencyPair.toLowerCase().includes('surface') ||
        v.reasoning.toLowerCase().includes('surface') ||
        v.reasoning.toLowerCase().includes('skew') ||
        v.reasoning.toLowerCase().includes('term structure')
      ),
      'conditional': views.filter(v => 
        v.currencyPair.toLowerCase().includes('conditional') ||
        v.reasoning.toLowerCase().includes('if ') ||
        v.reasoning.toLowerCase().includes('conditional') ||
        v.reasoning.toLowerCase().includes('depends on')
      ),
      'spot': views.filter(v => {
        // Only categorize as spot if it's not already categorized as vol, surface, or conditional
        const isVol = v.currencyPair.toLowerCase().includes('vol') ||
                     v.id.toLowerCase().includes('_vol_') ||
                     v.reasoning.toLowerCase().includes('volatility') ||
                     v.reasoning.toLowerCase().includes('implied vol') ||
                     v.reasoning.toLowerCase().includes('vol is') ||
                     v.reasoning.toLowerCase().includes('vol will') ||
                     v.reasoning.toLowerCase().includes('vol going')
        
        const isSurface = v.currencyPair.toLowerCase().includes('surface') ||
                         v.reasoning.toLowerCase().includes('surface') ||
                         v.reasoning.toLowerCase().includes('skew') ||
                         v.reasoning.toLowerCase().includes('term structure')
        
        const isConditional = v.currencyPair.toLowerCase().includes('conditional') ||
                             v.reasoning.toLowerCase().includes('if ') ||
                             v.reasoning.toLowerCase().includes('conditional') ||
                             v.reasoning.toLowerCase().includes('depends on')
        
        return !isVol && !isSurface && !isConditional
      })
    }
  }

  const groupMacroViewsByCategory = (views: MacroView[]) => {
    return {
      'economic-growth': views.filter(v => v.category === 'economic-growth'),
      'inflation': views.filter(v => v.category === 'inflation'),
      'central-bank': views.filter(v => v.category === 'central-bank'),
      'geopolitical': views.filter(v => v.category === 'geopolitical')
    }
  }

  const renderDirectionalViewCard = (title: string, description: string, views: MarketView[]) => (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge variant="outline" className="font-normal">
            <Clock className="mr-1 h-3 w-3" />
            {views.length > 0 ? formatDate(views[0].lastUpdated) : 'No data'}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {views.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No views captured yet</p>
            <p className="text-xs">Start a conversation with Dom to populate this section</p>
          </div>
        ) : (
          views.map((view) => (
            <div key={view.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge className={`${getDirectionColor(view.direction)} mr-2`}>
                    {getDirectionIcon(view.direction)}
                    {view.direction.charAt(0).toUpperCase() + view.direction.slice(1)}
                  </Badge>
                  <span className="font-medium">{view.currencyPair}</span>
                  {view.confidence && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {view.confidence}% confidence
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  <span>From AI conversation</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                "{view.reasoning}"
              </p>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" className="ml-auto">
          <Edit className="h-4 w-4 mr-2" />
          Edit Views
        </Button>
      </CardFooter>
    </Card>
  )

  const renderMacroViewCard = (title: string, description: string, views: MacroView[]) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {views.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No views captured yet</p>
            <p className="text-xs">Start a conversation with Dom to populate this section</p>
          </div>
        ) : (
          views.map((view) => (
            <div key={view.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge className={`${getOutlookColor(view.outlook)} mr-2`}>
                    {getOutlookIcon(view.outlook)}
                    {view.outlook.charAt(0).toUpperCase() + view.outlook.slice(1)}
                  </Badge>
                  <span className="font-medium">{view.topic}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  <span>{formatDate(view.lastUpdated)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                "{view.reasoning}"
              </p>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="ml-auto">
          <Edit className="h-4 w-4 mr-2" />
          Edit Views
        </Button>
      </CardFooter>
    </Card>
  )

  const groupedDirectional = groupViewsByTimeframe(marketViews.directionalViews)
  const groupedByInstrument = groupViewsByInstrument(marketViews.directionalViews)
  const groupedMacro = groupMacroViewsByCategory(marketViews.macroViews)

  // Render a simple list view for all views
  const renderAllViewsList = () => {
    const allViews = [
      ...marketViews.directionalViews.map(v => ({ ...v, type: 'directional' as const })),
      ...marketViews.macroViews.map(v => ({ ...v, type: 'macro' as const }))
    ].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())

    if (allViews.length === 0) {
      return (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No market views captured yet</h3>
              <p className="text-sm">Start a conversation with Dom to populate your market views</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>All Market Views ({allViews.length})</CardTitle>
          <CardDescription>Complete list of your market views, sorted by most recent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[48rem] overflow-y-auto">
          {allViews.map((view) => (
            <div key={view.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {view.type === 'directional' ? (
                    <>
                      <Badge className={`${getDirectionColor((view as any).direction)}`}>
                        {getDirectionIcon((view as any).direction)}
                        {(view as any).direction.charAt(0).toUpperCase() + (view as any).direction.slice(1)}
                      </Badge>
                      <span className="font-medium">{(view as any).currencyPair}</span>
                      {(view as any).confidence && (
                        <Badge variant="outline" className="text-xs">
                          {(view as any).confidence}% confidence
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {(view as any).timeframe}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Badge className={`${getOutlookColor((view as any).outlook)}`}>
                        {getOutlookIcon((view as any).outlook)}
                        {(view as any).outlook.charAt(0).toUpperCase() + (view as any).outlook.slice(1)}
                      </Badge>
                      <span className="font-medium">{(view as any).topic}</span>
                      <Badge variant="outline" className="text-xs">
                        {(view as any).category}
                      </Badge>
                    </>
                  )}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  <span>{formatDate(view.lastUpdated)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                "{view.reasoning}"
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Market Views</h2>
          <p className="text-muted-foreground">
            Macroeconomic and directional views captured from your conversations with Dom.
          </p>
          {marketViews.lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {formatDate(marketViews.lastUpdated)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleRefresh} disabled={isRefreshing || isAutoRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${(isRefreshing || isAutoRefreshing) ? 'animate-spin' : ''}`} />
            {(isRefreshing || isAutoRefreshing) ? 'Refreshing...' : 'Refresh Views'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Views
            {(marketViews.directionalViews.length + marketViews.macroViews.length) > 0 && (
              <Badge variant="secondary" className="ml-2">
                {marketViews.directionalViews.length + marketViews.macroViews.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="directional">
            Directional Views
            {marketViews.directionalViews.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {marketViews.directionalViews.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="macro">
            Macroeconomic Views
            {marketViews.macroViews.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {marketViews.macroViews.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderAllViewsList()}
        </TabsContent>

        <TabsContent value="directional" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {renderDirectionalViewCard(
              "Spot Views",
              "Your directional bias on currency spot rates",
              groupedByInstrument['spot']
            )}
            {renderDirectionalViewCard(
              "Volatility Views", 
              "Your expectations on FX market volatility",
              groupedByInstrument['vol']
            )}
            {renderDirectionalViewCard(
              "Surface Views",
              "Your views on volatility surface, skew, and term structure",
              groupedByInstrument['surface']
            )}
            {renderDirectionalViewCard(
              "Conditional Views",
              "Your conditional market views and scenario-based expectations",
              groupedByInstrument['conditional']
            )}
          </div>
        </TabsContent>

        <TabsContent value="macro" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {renderMacroViewCard(
              "Economic Growth Outlook",
              "Your views on global economic growth affecting FX markets",
              groupedMacro['economic-growth']
            )}
            {renderMacroViewCard(
              "Inflation Expectations",
              "Your views on inflation trends across major economies",
              groupedMacro['inflation']
            )}
            {renderMacroViewCard(
              "Central Bank Policy Expectations",
              "Your views on central bank policies affecting FX markets",
              groupedMacro['central-bank']
            )}
            {renderMacroViewCard(
              "Geopolitical Risk Assessment",
              "Your views on geopolitical factors affecting currency markets",
              groupedMacro['geopolitical']
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 