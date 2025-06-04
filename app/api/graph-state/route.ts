import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get environment variables
    const apiUrl = process.env.LANGGRAPH_API_URL
    const apiKey = process.env.LANGGRAPH_API_KEY
    const assistantId = process.env.LANGGRAPH_ASSISTANT_ID

    if (!apiUrl || !apiKey) {
      console.error('Missing required environment variables:', { 
        hasApiUrl: !!apiUrl, 
        hasApiKey: !!apiKey 
      })
      return NextResponse.json({ 
        error: 'Server configuration error' 
      }, { status: 500 })
    }

    console.log('Creating new thread to fetch user market views...')
    
    // Always create a new thread for market views (they are global user data)
    const createThreadResponse = await fetch(`${apiUrl}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        assistant_id: assistantId,
      })
    })

    if (!createThreadResponse.ok) {
      console.error('Failed to create thread for market views')
      return NextResponse.json({ 
        error: 'Could not create thread for graph state' 
      }, { status: 500 })
    }

    const threadData = await createThreadResponse.json()
    const threadId = threadData.thread_id
    console.log('Created new thread:', threadId)
    
    // Send a minimal message to initialize the user's global context (including market views)
    console.log('Sending minimal message to initialize user context...')
    const runResponse = await fetch(`${apiUrl}/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        input: {
          messages: [
            {
              role: 'human',
              content: 'hello'
            }
          ]
        }
      })
    })
    
    if (!runResponse.ok) {
      console.error('Failed to initialize thread')
      return NextResponse.json({ 
        error: 'Could not initialize thread for graph state' 
      }, { status: 500 })
    }

    const runData = await runResponse.json()
    console.log('Initialization run created:', runData.run_id)
    
    // Poll for completion
    let attempts = 0
    const maxAttempts = 30 // 30 seconds max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const statusResponse = await fetch(
        `${apiUrl}/threads/${threadId}/runs/${runData.run_id}`,
        { headers: { 'X-Api-Key': apiKey } }
      )
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        console.log(`Initialization poll ${attempts + 1}:`, statusData.status)
        
        if (statusData.status === 'success') {
          console.log('Thread initialized successfully')
          break
        } else if (statusData.status === 'error') {
          console.error('Initialization failed:', statusData.error)
          break
        }
      }
      attempts++
    }

    console.log('Fetching graph state for thread:', threadId)

    // Fetch the current thread state
    const stateResponse = await fetch(
      `${apiUrl}/threads/${threadId}/state`,
      {
        headers: { 'X-Api-Key': apiKey }
      }
    )

    if (!stateResponse.ok) {
      console.error('Failed to get thread state:', stateResponse.status)
      return NextResponse.json({ 
        error: 'Failed to fetch graph state',
        details: `HTTP ${stateResponse.status}`
      }, { status: stateResponse.status })
    }

    const stateData = await stateResponse.json()
    
    console.log('=== GRAPH STATE API DEBUG ===')
    console.log('State data keys:', Object.keys(stateData))
    console.log('State values keys:', stateData.values ? Object.keys(stateData.values) : 'No values')
    console.log('Market views available:', !!stateData.values?.market_views)
    console.log('Market views count:', stateData.values?.market_views ? Object.keys(stateData.values.market_views).length : 0)
    console.log('=== END DEBUG ===')

    // Return the graph state data
    return NextResponse.json({
      success: true,
      graph_state: {
        current_query: stateData.values?.current_query,
        intent: stateData.values?.intent,
        preferences: stateData.values?.preferences,
        market_views: stateData.values?.market_views,
        full_state: stateData.values
      },
      thread_id: threadId,
      created_new_thread: true // Always true now since we always create new threads
    })

  } catch (error) {
    console.error('Graph state API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({ 
    error: 'Method not allowed. Use GET to fetch graph state.' 
  }, { status: 405 })
} 