import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, threadId } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ 
        error: 'Message is required' 
      }, { status: 400 })
    }

    // Check if this is just a thread initialization call
    const isInitialization = message.trim() === "Initialize thread" && !threadId

    // Get environment variables
    const apiUrl = process.env.LANGGRAPH_API_URL
    const apiKey = process.env.LANGGRAPH_API_KEY
    const assistantId = process.env.LANGGRAPH_ASSISTANT_ID || 'vol_multi'

    if (!apiUrl || !apiKey) {
      console.error('Missing required environment variables:', { 
        hasApiUrl: !!apiUrl, 
        hasApiKey: !!apiKey 
      })
      return NextResponse.json({ 
        error: 'Server configuration error' 
      }, { status: 500 })
    }

    // For initialization, we just create a thread without sending the initialization message
    if (isInitialization) {
      console.log('Creating thread for initialization')
      
      const response = await fetch(`${apiUrl}/threads`, {
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
                content: "Hello" // Simple greeting to initialize the thread
              }
            ]
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('LangGraph API error during initialization:', response.status, errorText)
        return NextResponse.json({ 
          error: 'Failed to initialize thread',
          details: errorText 
        }, { status: response.status })
      }

      const data = await response.json()
      console.log('Thread initialized:', { threadId: data.thread_id })
      
      return NextResponse.json({
        content: "Thread initialized successfully",
        thread_id: data.thread_id,
        isInitialization: true
      })
    }

    // Determine endpoint based on whether we have a thread ID
    const endpoint = threadId 
      ? `${apiUrl}/threads/${threadId}/runs`
      : `${apiUrl}/threads`

    console.log('LangGraph API call:', { endpoint, hasThreadId: !!threadId, messageLength: message.length })

    // Use the exact working cURL format
    const response = await fetch(endpoint, {
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
              role: 'human', // Use 'human' not 'user' as per working cURL
              content: message
            }
          ]
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('LangGraph API error:', response.status, errorText)
      return NextResponse.json({ 
        error: 'Failed to communicate with LangGraph API',
        details: errorText 
      }, { status: response.status })
    }

    const data = await response.json()
    console.log('LangGraph API response:', { 
      hasThreadId: !!data.thread_id, 
      hasRunId: !!data.run_id,
      status: data.status 
    })
    
    // For new thread creation, we get thread_id directly
    // For follow-up messages, we need to poll the run status
    let finalThreadId = threadId || data.thread_id
    let runId = data.run_id
    
    // If we have a run_id, we need to poll for completion
    if (runId) {
      console.log('Polling for run completion:', { runId, threadId: finalThreadId })
      
      // Poll for run completion
      let attempts = 0
      const maxAttempts = 30 // 30 seconds max
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        
        const statusResponse = await fetch(
          `${apiUrl}/threads/${finalThreadId}/runs/${runId}`,
          {
            headers: { 'X-Api-Key': apiKey }
          }
        )
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          console.log(`Poll attempt ${attempts + 1}:`, statusData.status)
          
          if (statusData.status === 'success') {
            // Get the full thread state to extract the response
            const stateResponse = await fetch(
              `${apiUrl}/threads/${finalThreadId}/state`,
              {
                headers: { 'X-Api-Key': apiKey }
              }
            )
            
            if (stateResponse.ok) {
              const stateData = await stateResponse.json()
              const messages = stateData.values?.messages || []
              const lastMessage = messages[messages.length - 1]
              
              console.log('Successfully retrieved response:', { 
                messageCount: messages.length,
                hasLastMessage: !!lastMessage 
              })
              
              return NextResponse.json({
                content: lastMessage?.content || "I'm processing your request. Please try again.",
                thread_id: finalThreadId,
                graph_state: {
                  current_query: stateData.values?.current_query,
                  intent: stateData.values?.intent,
                  preferences: stateData.values?.preferences,
                  market_views: stateData.values?.market_views
                }
              })
            } else {
              console.error('Failed to get thread state:', stateResponse.status)
            }
            break
          } else if (statusData.status === 'error') {
            console.error('Run failed:', statusData.error)
            return NextResponse.json({
              error: 'Run failed',
              details: statusData.error || 'Unknown error'
            }, { status: 500 })
          }
        } else {
          console.error('Status check failed:', statusResponse.status)
        }
        
        attempts++
      }
      
      // If we timeout, return what we have
      console.warn('Polling timeout reached')
      return NextResponse.json({
        content: "I'm still processing your request. Please try again in a moment.",
        thread_id: finalThreadId
      })
    }
    
    // For thread creation without run_id, return basic response
    return NextResponse.json({
      content: "Thread created successfully. Please send your message.",
      thread_id: finalThreadId
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'LangGraph Chat API is running',
    config: {
      hasApiKey: !!process.env.LANGGRAPH_API_KEY,
      hasApiUrl: !!process.env.LANGGRAPH_API_URL,
      assistantId: process.env.LANGGRAPH_ASSISTANT_ID
    }
  })
}
