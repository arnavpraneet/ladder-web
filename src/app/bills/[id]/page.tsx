'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PdfViewer from '@/components/PdfViewer';
import ChatInterface from '@/components/ChatInterface';
import { Bill, ChatMessage } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText } from 'lucide-react';

export default function BillDetail({ params }: { params: { id: string } }) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch bill details
  const fetchBill = useCallback(async () => {
    try {
      const response = await fetch(`/api/bills/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch bill');
      
      const data = await response.json();
      setBill(data.bill);
    } catch (error) {
      console.error('Error fetching bill:', error);
    }
  }, [params.id]);

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
          billId: params.id,
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

  // Load bill data only
  useEffect(() => {
    fetchBill();
  }, [fetchBill]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="bg-white border-b py-4 px-6 sticky top-0 z-10">
        <div className="container mx-auto flex items-center">
          <Button 
            asChild 
            variant="ghost" 
            className="mr-4"
            size="sm"
          >
            <Link href="/">
              <ArrowLeft size={16} className="mr-1" />
              Back to Bills
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <div className="flex items-center">
            <FileText size={18} className="mr-2 text-primary" />
            <h1 className="text-xl font-semibold text-primary">
              {bill ? bill.title : 'Loading bill...'}
            </h1>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer (Left half) */}
        <div className="w-1/2 h-full border-r">
          {bill ? (
            <div className="h-full">
              <PdfViewer pdfUrl={bill.pdfUrl} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        
        {/* Chat Interface (Right half) */}
        <div className="w-1/2 h-full">
          <ChatInterface
            billId={params.id}
            chatHistory={chatHistory}
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
} 