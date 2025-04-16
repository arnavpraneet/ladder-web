import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

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

    // In a real application, you would call your model API here
    // For now, we'll simulate a response
    const modelResponse = `This is a simulated response about the bill: ${bill.title}. 
    In a real application, this would be a response from your model API about the bill content.`;

    // Store the message and response
    const chatMessage = await prisma.chatMessage.create({
      data: {
        message,
        response: modelResponse,
        billId,
      },
    });

    return NextResponse.json({ 
      message: chatMessage.message, 
      response: chatMessage.response 
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 