import React, { createContext, useContext, useState, ReactNode } from 'react'

// Define the structure for market views from the graph state
export interface MarketView {
  id: string
  currencyPair: string
  direction: 'bullish' | 'bearish' | 'neutral'
  timeframe: 'short-term' | 'medium-term' | 'long-term'
  confidence: number // 0-100
  reasoning: string
  lastUpdated: Date
  conversationId?: string
}

export interface MacroView {
  id: string
  topic: string
  category: 'economic-growth' | 'inflation' | 'central-bank' | 'geopolitical'
  outlook: 'positive' | 'negative' | 'neutral'
  reasoning: string
  lastUpdated: Date
  conversationId?: string
}

export interface MarketViewsState {
  directionalViews: MarketView[]
  macroViews: MacroView[]
  lastUpdated: Date | null
}

interface MarketViewsContextType {
  marketViews: MarketViewsState
  updateMarketViews: (graphState: any) => void
  refreshMarketViews: (threadId: string) => Promise<boolean>
  clearMarketViews: () => void
  isRefreshing: boolean
}

const MarketViewsContext = createContext<MarketViewsContextType | undefined>(undefined)

export function MarketViewsProvider({ children }: { children: ReactNode }) {
  const [marketViews, setMarketViews] = useState<MarketViewsState>({
    directionalViews: [],
    macroViews: [],
    lastUpdated: null
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const updateMarketViews = (graphState: any) => {
    console.log('=== UPDATING MARKET VIEWS ===')
    console.log('Graph state received:', graphState)
    
    if (!graphState?.market_views && !graphState?.full_state?.market_views) {
      console.log('No market_views found in graph state')
      return
    }
    
    // Use market_views from either direct or full_state
    const marketViewsData = graphState.market_views || graphState.full_state?.market_views
    console.log('Market views data to process:', marketViewsData)
    
    const newDirectionalViews: MarketView[] = []
    const newMacroViews: MacroView[] = []
    
    // Process each market view from the LangGraph state
    Object.entries(marketViewsData).forEach(([key, view]: [string, any]) => {
      console.log(`Processing view: ${key}`, view)
      
      // Parse the key to extract asset, instrument, and timeframe
      // Format examples: "EURUSD_spot_3_months", "USDJPY_vol_1_week", "BTC_vol_medium_term"
      const parts = key.split('_')
      const asset = parts[0] // EURUSD, USDJPY, BTC, etc.
      
      // Determine if this is a directional view or macro view
      if (asset === 'GLOBAL' || view.asset === 'GLOBAL') {
        // This is a macro view
        const macroView: MacroView = {
          id: key,
          topic: `${asset} ${view.instrument || 'market'} outlook`,
          category: 'geopolitical', // Default category, could be enhanced
          outlook: view.direction === 'bullish' ? 'positive' : 
                  view.direction === 'bearish' ? 'negative' : 'neutral',
          reasoning: view.rationale || 'No specific reasoning provided',
          lastUpdated: new Date(view.created_at || Date.now()),
          conversationId: graphState.current_query || undefined
        }
        newMacroViews.push(macroView)
      } else {
        // This is a directional market view
        const currencyPair = asset
        const instrument = view.instrument || (key.includes('_vol_') ? 'vol' : 'spot')
        const timeframe = view.timeframe || parts.slice(instrument === 'vol' ? 2 : 1).join('_')
        
        console.log(`  - Asset: ${asset}`)
        console.log(`  - Instrument detected: ${instrument} (from view.instrument: ${view.instrument}, key contains '_vol_': ${key.includes('_vol_')})`)
        console.log(`  - Timeframe: ${timeframe}`)
        
        // Map timeframe to our standard format
        let standardTimeframe: 'short-term' | 'medium-term' | 'long-term' = 'medium-term'
        if (timeframe.includes('week') || timeframe.includes('1_month')) {
          standardTimeframe = 'short-term'
        } else if (timeframe.includes('6_months') || timeframe.includes('long') || timeframe.includes('july')) {
          standardTimeframe = 'long-term'
        }
        
        // Map conviction to confidence percentage
        let confidence = 50 // Default
        if (view.conviction === 'high') confidence = 85
        else if (view.conviction === 'medium') confidence = 65
        else if (view.conviction === 'low') confidence = 35
        
        const finalCurrencyPair = `${currencyPair}${instrument === 'vol' ? ' Vol' : ''}`
        console.log(`  - Final currency pair: ${finalCurrencyPair}`)
        
        const marketView: MarketView = {
          id: key,
          currencyPair: finalCurrencyPair,
          direction: view.direction === 'bullish' ? 'bullish' : 
                    view.direction === 'bearish' ? 'bearish' : 'neutral',
          timeframe: standardTimeframe,
          confidence: confidence,
          reasoning: view.rationale || `${view.direction} view on ${currencyPair} ${instrument}`,
          lastUpdated: new Date(view.created_at || Date.now()),
          conversationId: graphState.current_query || undefined
        }
        newDirectionalViews.push(marketView)
        console.log(`  - Created market view:`, marketView)
      }
    })
    
    console.log('Processed directional views:', newDirectionalViews.length)
    console.log('Processed macro views:', newMacroViews.length)
    
    // Update the state
    setMarketViews({
      directionalViews: newDirectionalViews,
      macroViews: newMacroViews,
      lastUpdated: new Date()
    })
    
    console.log('=== MARKET VIEWS UPDATED ===')
  }

  const refreshMarketViews = async (threadId: string): Promise<boolean> => {
    if (!threadId) {
      console.log('No thread ID provided for refresh')
      return false
    }

    setIsRefreshing(true)
    console.log('=== REFRESHING MARKET VIEWS ===')
    console.log('Thread ID:', threadId)

    try {
      const response = await fetch(`/api/graph-state?threadId=${threadId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to refresh market views:', errorData)
        return false
      }

      const data = await response.json()
      console.log('Refresh response:', data)

      if (data.success && data.graph_state) {
        updateMarketViews(data.graph_state)
        console.log('Market views refreshed successfully')
        return true
      } else {
        console.log('No graph state in refresh response')
        return false
      }
    } catch (error) {
      console.error('Error refreshing market views:', error)
      return false
    } finally {
      setIsRefreshing(false)
    }
  }

  const clearMarketViews = () => {
    setMarketViews({
      directionalViews: [],
      macroViews: [],
      lastUpdated: null
    })
  }

  return (
    <MarketViewsContext.Provider value={{ marketViews, updateMarketViews, refreshMarketViews, clearMarketViews, isRefreshing }}>
      {children}
    </MarketViewsContext.Provider>
  )
}

export function useMarketViews() {
  const context = useContext(MarketViewsContext)
  if (context === undefined) {
    throw new Error('useMarketViews must be used within a MarketViewsProvider')
  }
  return context
} 