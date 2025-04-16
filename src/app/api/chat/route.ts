import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { billId, message } = body;

    if (!billId || !message) {
      return NextResponse.json(
        { error: 'Bill ID and message are required' },
        { status: 400 }
      );
    }

    // Check if bill exists
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
    });

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    // Extract the PDF filename from the pdfUrl
    const pdfFilename = path.basename(bill.pdfUrl);

    // In a real application, you would call your model API here
    // For now, we'll simulate a response
    const modelResponse = `This is a simulated response about the document "${pdfFilename}" with title: ${bill.title}. 
    In a real application, this would be a response from your model API about the bill content.`;

    // Return the response without saving to database
    return NextResponse.json({ 
      message: message, 
      response: modelResponse 
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 