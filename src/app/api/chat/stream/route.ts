import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';

// Use environment variables for credentials - only need endpoint and API key
const AGENT_KEY = process.env.DIGITALOCEAN_AGENT_KEY || "";
const AGENT_ENDPOINT = process.env.DIGITALOCEAN_AGENT_ENDPOINT || "";

// Check if the API keys are available
const HAS_API_CONFIG = AGENT_KEY !== "" && AGENT_ENDPOINT !== "";

// Mock responses with thinking for testing
const MOCK_THINKING_RESPONSES = [
  {
    thinking: "Let me analyze the bill to understand its key provisions and purpose. This bill appears to be related to aircraft objects and their protection. I should look for information about what specific interests are being protected, who are the stakeholders, and what mechanisms are proposed for protection.",
    answer: "The Protection of Interests in Aircraft Objects Bill, 2025 aims to safeguard financial interests in aircraft equipment by implementing international standards for security, repossession, and default remedies. It establishes a clear legal framework for aircraft financing and leasing transactions, which can help reduce costs and improve access to aircraft equipment."
  },
  {
    thinking: "I need to consider what this bill is trying to achieve. Based on the title and content, it seems to be addressing legal protections for interests related to aircraft objects. This could include financial interests, ownership rights, or security interests. I should also consider international agreements that might be relevant, such as the Cape Town Convention.",
    answer: "This bill creates a legal framework to protect financial interests in aircraft assets. It appears to be implementing standards from the Cape Town Convention, which is an international treaty that standardizes transactions involving mobile equipment. The bill would help aircraft financiers and lessors have more certainty in their ability to repossess aircraft in the event of default, which could lower financing costs for airlines operating in the jurisdiction."
  }
];

export async function POST(request: NextRequest) {
  // Get the request body
  const body = await request.json();
  const { message, billId } = body;

  try {
    // Fetch the bill title from the database to include in the context
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
    });

    if (!bill) {
      throw new Error('Bill not found');
    }

    // Extract the PDF filename from the pdfUrl
    const pdfFilename = path.basename(bill.pdfUrl);

    // Use mock responses in these cases:
    // 1. If message includes "test thinking" explicitly for testing
    // 2. If API keys are not configured
    // 3. If it's in development mode
    if (message.toLowerCase().includes("test thinking") || !HAS_API_CONFIG || process.env.NODE_ENV !== "production") {
      // Use a mock response with thinking sections
      const mockResponse = MOCK_THINKING_RESPONSES[Math.floor(Math.random() * MOCK_THINKING_RESPONSES.length)];
      
      // Create a streaming response to simulate real response with thinking and answer
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
      
      // Generate specific mock response based on the bill title
      const customThinking = `Let me analyze this bill titled "${bill.title}". I need to understand the key provisions, impact, and purpose of this legislation. I'll examine how it relates to existing laws and what changes it introduces.`;
      const customAnswer = `The "${bill.title}" appears to be legislation related to ${pdfFilename.includes('Aircraft') ? 'aviation and aircraft financing' : pdfFilename.includes('Banking') ? 'banking regulations' : 'general governance and regulation'}. This bill likely aims to update existing frameworks and introduce new provisions to address contemporary challenges in this domain.`;
      
      // Simulate streaming in the background
      (async () => {
        try {
          // First send the thinking part
          await writer.write(encoder.encode(`data: ${JSON.stringify({ content: "<think>" })}\n\n`));
          
          // Stream the thinking part word by word
          const thinkingWords = customThinking.split(' ');
          for (let i = 0; i < thinkingWords.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Delay to simulate typing
            await writer.write(encoder.encode(`data: ${JSON.stringify({ content: thinkingWords[i] + ' ' })}\n\n`));
          }
          
          // Add the thinking end tag
          await writer.write(encoder.encode(`data: ${JSON.stringify({ content: "</think>" })}\n\n`));
          
          // Stream the answer part word by word
          const answerWords = customAnswer.split(' ');
          for (let i = 0; i < answerWords.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Delay to simulate typing
            await writer.write(encoder.encode(`data: ${JSON.stringify({ content: answerWords[i] + ' ' })}\n\n`));
          }
          
          // Signal end of stream
          await writer.write(encoder.encode(`data: [DONE]\n\n`));
        } catch (error) {
          console.error('Error in mock streaming:', error);
        } finally {
          await writer.close();
        }
      })();
      
      return streamResponse;
    }

    // If we have API keys and are not using mock responses, make the real API call
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
        // Create a more specific prompt that includes the bill title and PDF filename
        const enhancedMessage = `Regarding the document "${pdfFilename}" with title "${bill.title}": ${message}`;

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
                content: enhancedMessage
              }
            ],
            stream: true,
            context: {
              bill_id: billId,
              bill_title: bill.title,
              pdf_filename: pdfFilename,
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