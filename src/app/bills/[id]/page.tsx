import React from 'react';
import Link from 'next/link';
import PdfViewer from '@/components/PdfViewer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ClientBillDetails from '@/components/ClientBillDetails';

export default async function BillDetail({ params }: { params: { id: string } }) {
  // Await the params
  const { id } = await params;
  
  // Fetch bill server-side
  const bill = await prisma.bill.findUnique({
    where: { id },
  });

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
          <ClientBillDetails billId={id} bill={bill} />
        </div>
      </div>
    </div>
  );
} 