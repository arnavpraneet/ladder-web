'use client';

import { useState } from 'react';
import type { Bill, ChatMessage } from '@/types/types';
import ChatInterface from '@/components/ChatInterface';

interface ClientBillDetailsProps {
  billId: string;
  bill: Bill | null;
}

export default function ClientBillDetails({ billId, bill }: ClientBillDetailsProps) {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Send message to chat API (non-streaming fallback)
  const sendMessage = async (message: string, streamedResponse?: string) => {
    setIsLoading(true);
    
    try {
      // If we have a streamed response, add it directly to the chat history
      if (streamedResponse) {
        // Add new message with the streamed response to chat history
        setChatHistory((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            message,
            response: streamedResponse,
            createdAt: new Date(),
          },
        ]);
        return;
      }
      
      // Otherwise, fetch response from the API (non-streaming fallback)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billId,
          message,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      
      // Add new message to chat history
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          message,
          response: data.response,
          createdAt: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatInterface
      billId={billId}
      chatHistory={chatHistory}
      onSendMessage={sendMessage}
      isLoading={isLoading}
    />
  );
} 