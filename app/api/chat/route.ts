import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, threadId } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ 
        error: 'Message is required' 
      }, { status: 400 })
    }

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

    // Use a mutable variable for thread ID
    let currentThreadId = threadId

    // If no threadId, create a thread first, then send the message
    if (!currentThreadId) {
      console.log('Creating new thread first...')
      
      // Step 1: Create empty thread
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
        const errorText = await createThreadResponse.text()
        console.error('Failed to create thread:', createThreadResponse.status, errorText)
        return NextResponse.json({ 
          error: 'Failed to create thread',
          details: errorText 
        }, { status: createThreadResponse.status })
      }

      const threadData = await createThreadResponse.json()
      currentThreadId = threadData.thread_id
      console.log('Created thread:', currentThreadId)

      if (!currentThreadId) {
        return NextResponse.json({ 
          error: 'Failed to get thread ID from created thread' 
        }, { status: 500 })
      }
    }

    // Step 2: Send message to the thread (existing or newly created)
    console.log('Sending message to thread:', currentThreadId)
    const response = await fetch(`${apiUrl}/threads/${currentThreadId}/runs`, {
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
    
    // Add detailed logging for debugging
    console.log('=== FULL API RESPONSE DEBUG ===')
    console.log('Response keys:', Object.keys(data))
    console.log('Full response:', JSON.stringify(data, null, 2))
    console.log('=== END RESPONSE DEBUG ===')
    
    // For new thread creation, we get thread_id directly
    // For follow-up messages, we need to poll the run status
    let finalThreadId = currentThreadId || data.thread_id
    let runId = data.run_id
    
    // If we have a run_id, we need to poll for completion
    if (runId) {
      console.log('Polling for run completion:', { runId, threadId: finalThreadId })
      
      // Poll for run completion
      let attempts = 0
      const maxAttempts = 120 // 2 minutes max for complex financial analysis
      
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
          console.log(`Poll attempt ${attempts + 1}/${maxAttempts}:`, statusData.status)
          
          // Add more detailed status logging for long-running queries
          if (attempts > 30 && attempts % 10 === 0) {
            console.log(`Long-running query: still ${statusData.status} after ${attempts} seconds`)
          }
          
          if (statusData.status === 'success') {
            // Try to get response from the run data first
            if (statusData.output && statusData.output.messages) {
              const messages = statusData.output.messages
              const lastMessage = messages[messages.length - 1]
              
              console.log('=== USING RUN OUTPUT ===')
              console.log('Run output messages:', messages.length)
              console.log('Last message from run:', JSON.stringify(lastMessage, null, 2))
              
              if (lastMessage && lastMessage.content) {
                return NextResponse.json({
                  content: lastMessage.content,
                  thread_id: finalThreadId,
                })
              }
            }
            
            // Fallback to thread state if run output doesn't have messages
            // Try getting just messages first instead of full state
            const messagesResponse = await fetch(
              `${apiUrl}/threads/${finalThreadId}/messages`,
              {
                headers: { 'X-Api-Key': apiKey }
              }
            )
            
            if (messagesResponse.ok) {
              const messagesData = await messagesResponse.json()
              console.log('=== MESSAGES ENDPOINT ===')
              console.log('Messages response:', JSON.stringify(messagesData, null, 2))
              
              // Extract the last assistant message
              if (messagesData && Array.isArray(messagesData)) {
                const lastAssistantMessage = messagesData
                  .filter(msg => msg.role === 'assistant' || msg.type === 'ai')
                  .pop()
                
                if (lastAssistantMessage && lastAssistantMessage.content) {
                  console.log('Using message from messages endpoint')
                  return NextResponse.json({
                    content: lastAssistantMessage.content,
                    thread_id: finalThreadId,
                  })
                }
              }
            } else {
              console.log('Messages endpoint not available, falling back to state')
            }
            
            // Final fallback to thread state
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
              
              console.log('=== LANGGRAPH RESPONSE DEBUG ===')
              console.log('Full state data keys:', Object.keys(stateData))
              console.log('State values keys:', stateData.values ? Object.keys(stateData.values) : 'No values')
              console.log('Message count:', messages.length)
              console.log('Last message type:', typeof lastMessage?.content)
              console.log('Last message content preview:', JSON.stringify(lastMessage?.content).substring(0, 200) + '...')
              
              // ✅ NEW: Log the full state data to see what's available
              console.log('=== FULL STATE DATA ===')
              console.log('State data:', JSON.stringify(stateData, null, 2))
              console.log('=== END FULL STATE ===')
              
              // Extract just the text content from the assistant's response
              let responseContent = "I'm processing your request. Please try again."
              
              if (lastMessage) {
                // Handle different possible response formats
                if (typeof lastMessage.content === 'string') {
                  responseContent = lastMessage.content
                  console.log('Using string content directly')
                } else if (Array.isArray(lastMessage.content)) {
                  // If content is an array, find text content
                  const textContent = lastMessage.content.find((item: any) => item.type === 'text')
                  responseContent = textContent?.text || lastMessage.content[0]?.text || JSON.stringify(lastMessage.content)
                  console.log('Using array content, found text:', !!textContent)
                } else if (lastMessage.content?.text) {
                  responseContent = lastMessage.content.text
                  console.log('Using content.text property')
                } else {
                  // Fallback: stringify the content
                  responseContent = JSON.stringify(lastMessage.content)
                  console.log('Using stringified content as fallback')
                }
              }
              
              console.log('Final response length:', responseContent.length)
              console.log('=== END DEBUG ===')
              
              return NextResponse.json({
                content: responseContent,
                thread_id: finalThreadId,
                graph_state: {
                  current_query: stateData.values?.current_query,
                  intent: stateData.values?.intent,
                  preferences: stateData.values?.preferences,
                  market_views: stateData.values?.market_views,
                  // ✅ NEW: Include scenario analysis fields
                  scenario_analysis: stateData.values?.scenario_analysis,
                  batch_scenario_analysis: stateData.values?.batch_scenario_analysis,
                  scenario_results: stateData.values?.scenario_results,
                  // ✅ NEW: Include the full state values for debugging
                  full_state: stateData.values
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
      console.warn(`Polling timeout reached after ${maxAttempts} seconds`)
      return NextResponse.json({
        content: "Your query is taking longer than expected to process. This often happens with complex financial analysis. Please try asking a simpler question or try again in a moment.",
        thread_id: finalThreadId
      })
    }
    
    // For thread creation without run_id, try to get the response from the thread
    console.log('No run_id found, attempting to get response from thread state')
    
    // Try to get the response from the thread state
    try {
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
        
        console.log('=== THREAD STATE FALLBACK ===')
        console.log('Message count:', messages.length)
        console.log('Last message:', JSON.stringify(lastMessage, null, 2))
        
        if (lastMessage && lastMessage.role === 'assistant') {
          let responseContent = "I'm here to help with your FX options trading questions."
          
          if (typeof lastMessage.content === 'string') {
            responseContent = lastMessage.content
          } else if (Array.isArray(lastMessage.content)) {
            const textContent = lastMessage.content.find((item: any) => item.type === 'text')
            responseContent = textContent?.text || lastMessage.content[0]?.text || responseContent
          } else if (lastMessage.content?.text) {
            responseContent = lastMessage.content.text
          }
          
          return NextResponse.json({
            content: responseContent,
            thread_id: finalThreadId,
          })
        }
      }
    } catch (error) {
      console.error('Failed to get thread state in fallback:', error)
    }
    
    // Final fallback - return a helpful message instead of "Thread created successfully"
    return NextResponse.json({
      content: "I'm here to help with your FX options trading questions. What would you like to know?",
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
