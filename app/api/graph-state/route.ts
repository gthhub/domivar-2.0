import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the thread ID from query parameters
    const { searchParams } = new URL(request.url)
    let threadId = searchParams.get('threadId')

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

    // If no threadId provided, try to find existing threads or create a minimal one
    if (!threadId) {
      console.log('No thread ID provided, looking for existing threads with data...')
      
      try {
        // First, try to list existing threads to see if any have market views
        const listThreadsResponse = await fetch(`${apiUrl}/threads`, {
          headers: { 'X-Api-Key': apiKey }
        })
        
        if (listThreadsResponse.ok) {
          const threadsData = await listThreadsResponse.json()
          console.log('Found existing threads:', threadsData.length || 0)
          
          // Try to find a thread with market views data
          if (threadsData && Array.isArray(threadsData) && threadsData.length > 0) {
            for (const thread of threadsData.slice(0, 5)) { // Check up to 5 most recent threads
              try {
                const testStateResponse = await fetch(
                  `${apiUrl}/threads/${thread.thread_id}/state`,
                  { headers: { 'X-Api-Key': apiKey } }
                )
                
                if (testStateResponse.ok) {
                  const testStateData = await testStateResponse.json()
                  const hasMarketViews = testStateData.values?.market_views && 
                                       Object.keys(testStateData.values.market_views).length > 0
                  
                  if (hasMarketViews) {
                    console.log('Found thread with market views:', thread.thread_id)
                    threadId = thread.thread_id
                    break
                  }
                }
              } catch (error) {
                console.log('Error checking thread:', thread.thread_id, error)
              }
            }
          }
        }
        
        // If we still don't have a threadId, create a new thread and properly initialize it
        if (!threadId) {
          console.log('No existing threads with market views found, creating and initializing new thread...')
          
          // Create a new thread
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

          if (createThreadResponse.ok) {
            const threadData = await createThreadResponse.json()
            threadId = threadData.thread_id
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
                      content: 'show me my current market views'
                    }
                  ]
                }
              })
            })
            
            if (runResponse.ok) {
              const runData = await runResponse.json()
              console.log('Initialization run created:', runData.run_id)
              
              // Poll for completion like the chat API does
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
            }
          } else {
            console.error('Failed to create thread for initialization')
            return NextResponse.json({ 
              error: 'Could not create thread for graph state' 
            }, { status: 500 })
          }
        }
      } catch (error) {
        console.error('Error finding/creating thread:', error)
        return NextResponse.json({ 
          error: 'Failed to initialize graph state' 
        }, { status: 500 })
      }
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
      created_new_thread: !searchParams.get('threadId') // Indicate if we created a new thread
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