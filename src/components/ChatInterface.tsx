import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SendHorizontal, MessageSquare } from 'lucide-react';

interface ChatInterfaceProps {
  billId: string | null;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInterface({
  billId,
  chatHistory,
  onSendMessage,
  isLoading,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever chat history changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && billId) {
      onSendMessage(message);
      setMessage('');
    }
  };

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
        {chatHistory.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare size={24} strokeWidth={1.5} className="mx-auto mb-2" />
            <p>Ask questions about this bill to get started</p>
            <p className="text-sm mt-2">
              Try: "Summarize this bill" or "What is the purpose of this bill?"
            </p>
          </div>
        ) : (
          chatHistory.map((chat) => (
            <div key={chat.id} className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-lg py-2 px-4 max-w-[80%]">
                  <p>{chat.message}</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted/30 rounded-lg py-2 px-4 max-w-[80%] text-foreground">
                  <p className="whitespace-pre-wrap">{chat.response}</p>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
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
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!message.trim() || isLoading}
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