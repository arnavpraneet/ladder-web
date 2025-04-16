import { NextRequest } from 'next/server';

// Use environment variables for credentials - only need endpoint and API key
const AGENT_KEY = process.env.DIGITALOCEAN_AGENT_KEY || "";
const AGENT_ENDPOINT = process.env.DIGITALOCEAN_AGENT_ENDPOINT || "";

export async function POST(request: NextRequest) {
  // Get the request body
  const body = await request.json();
  const { message, billId } = body;

  try {
    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Start the streaming response
    const streamResponse = new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
    // Make the request to GenAI in the background
    (async () => {
      try {
        const genAIResponse = await fetch(`${AGENT_ENDPOINT}/api/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AGENT_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: message
              }
            ],
            stream: true,
            context: {
              bill_id: billId,
              // You can add more context here if needed
            }
          }),
        });
        
        if (!genAIResponse.ok) {
          const errorText = await genAIResponse.text();
          throw new Error(`GenAI API error: ${genAIResponse.status} ${errorText}`);
        }
        
        // Process the streaming response from GenAI
        const reader = genAIResponse.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get reader from response');
        }
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          
          // The GenAI API returns data in the format: data: {...}\n\n
          // We need to parse each line and extract the content
          const lines = chunk.split('\n\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const data = JSON.parse(line.slice(5).trim());
                
                // Extract the content and write to our stream
                if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                  const content = data.choices[0].delta.content;
                  await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                } else if (data.choices && data.choices[0] && data.choices[0].finish_reason === 'stop') {
                  // End of response
                  await writer.write(encoder.encode(`data: [DONE]\n\n`));
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in GenAI API request:', error);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Error processing your request' })}\n\n`));
      } finally {
        await writer.close();
      }
    })();
    
    return streamResponse;
  } catch (error) {
    console.error('Error in streaming API:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat message' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 