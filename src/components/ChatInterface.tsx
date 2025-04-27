import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SendHorizontal, MessageSquare } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ThinkingRenderer from '@/components/ThinkingRenderer';

interface ChatInterfaceProps {
  billId: string | null;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string, response?: string) => void;
  isLoading: boolean;
}

export default function ChatInterface({
  billId,
  chatHistory,
  onSendMessage,
  isLoading: globalIsLoading,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamedResponse, setCurrentStreamedResponse] = useState('');
  const [streamingMessages, setStreamingMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever chat history or streaming messages changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, streamingMessages, currentStreamedResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !billId || isStreaming || globalIsLoading) return;

    const userMessage = message;
    setMessage('');
    
    // Add user message to streaming messages
    const newUserMessage: ChatMessage = {
      id: `stream-${Date.now()}`,
      message: userMessage,
      response: '',
      createdAt: new Date(),
    };
    
    setStreamingMessages([...streamingMessages, newUserMessage]);
    setIsStreaming(true);
    setCurrentStreamedResponse('');
    
    try {
      // Call the streaming API
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          billId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message to streaming API');
      }

      // Handle the streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get reader from response');
      }

      let accumulatedResponse = '';
      
      // Process the stream
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Streaming is complete
              break;
            }
            
            // Decode the chunk and process each line
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line.startsWith('data:')) {
                const dataContent = line.slice(5).trim();
                
                if (dataContent === '[DONE]') {
                  // End of stream
                  break;
                }
                
                try {
                  const parsedData = JSON.parse(dataContent);
                  
                  if (parsedData.content) {
                    // Clean up any extraneous <think> tags if necessary
                    let content = parsedData.content;
                    
                    // If we see a new <think> tag but already have content, prepend the tag
                    if (content.includes('<think>') && accumulatedResponse.length > 0 && !accumulatedResponse.includes('<think>')) {
                      accumulatedResponse = '<think>' + accumulatedResponse;
                    }
                    
                    accumulatedResponse += content;
                    setCurrentStreamedResponse(accumulatedResponse);
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          
          // Only pass the response to the parent if we got a valid response
          if (accumulatedResponse) {
            // If the response doesn't have a </think> tag but has a <think> tag, add the closing tag
            if (accumulatedResponse.includes('<think>') && !accumulatedResponse.includes('</think>')) {
              accumulatedResponse += '</think>';
            }
            
            // Set streaming to false before calling onSendMessage to prevent any race conditions
            setIsStreaming(false);
            // Pass both message and accumulated response to parent for in-memory storage
            onSendMessage(userMessage, accumulatedResponse);
            // Clear streaming messages to prevent duplication
            setStreamingMessages([]);
          } else {
            setIsStreaming(false);
            // Use a fallback response if streaming didn't produce any content
            const fallbackResponse = "Sorry, I couldn't generate a response. Please try again.";
            setCurrentStreamedResponse(fallbackResponse);
            onSendMessage(userMessage, fallbackResponse);
            setStreamingMessages([]);
          }
        }
      };
      
      processStream();
    } catch (error) {
      console.error('Error in streaming chat:', error);
      // Create a friendly error message
      const errorResponse = "Sorry, I encountered an error while processing your request. Please try again.";
      setCurrentStreamedResponse(errorResponse);
      setIsStreaming(false);
      // Pass both the message and error response
      onSendMessage(userMessage, errorResponse);
      setStreamingMessages([]);
    }
  };

  // Show empty state if no bill is selected
  if (!billId) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center text-muted-foreground">
          <MessageSquare size={32} strokeWidth={1.5} className="mb-2" />
          <p>Select a bill to start chatting</p>
        </div>
      </div>
    );
  }

  // Combine regular chat history with streaming messages for display
  const displayMessages = [
    ...chatHistory,
    ...streamingMessages.filter(msg => !chatHistory.some(ch => ch.message === msg.message)),
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary text-primary-foreground py-3 px-4 flex items-center">
        <MessageSquare size={18} className="mr-2" />
        <h3 className="font-medium">Chat about this bill</h3>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-white custom-scrollbar"
      >
        {displayMessages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare size={24} strokeWidth={1.5} className="mx-auto mb-2" />
            <p>Ask questions about this bill to get started</p>
            <p className="text-sm mt-2">
              Try: "Summarize this bill" or "What is the purpose of this bill?"
            </p>
          </div>
        ) : (
          displayMessages.map((chat) => (
            <div key={chat.id} className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-lg py-2 px-4 max-w-[80%]">
                  <p>{chat.message}</p>
                </div>
              </div>
              
              {/* Display chat response or empty space for streaming responses */}
              {(chat.response || chat.id === streamingMessages[streamingMessages.length - 1]?.id) && (
                <div className="flex justify-start">
                  <div className="bg-muted/30 rounded-lg py-3 px-4 max-w-[85%] text-foreground">
                    {chat.id === streamingMessages[streamingMessages.length - 1]?.id ? (
                      <ThinkingRenderer content={currentStreamedResponse} isStreaming={true} />
                    ) : (
                      <ThinkingRenderer content={chat.response} />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Loading indicator for non-streaming requests */}
        {(globalIsLoading && !isStreaming) && (
          <div className="flex justify-start">
            <div className="bg-muted/30 rounded-lg py-2 px-4">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-primary/70 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-primary/70 rounded-full animate-bounce delay-75"></div>
                <div className="h-2 w-2 bg-primary/70 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Separator />
      
      <div className="p-3 bg-background">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question about this bill..."
            className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isStreaming || globalIsLoading}
          />
          <Button
            type="submit"
            disabled={!message.trim() || isStreaming || globalIsLoading}
            className="rounded-l-none"
          >
            <SendHorizontal size={16} className="mr-1" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
} 