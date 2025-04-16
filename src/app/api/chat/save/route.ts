import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { billId, message, response } = body;

    if (!billId || !message || !response) {
      return NextResponse.json(
        { error: 'Bill ID, message, and response are required' },
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

    // Store the message and response
    const chatMessage = await prisma.chatMessage.create({
      data: {
        message,
        response,
        billId,
      },
    });

    return NextResponse.json({ 
      success: true,
      messageId: chatMessage.id
    });
  } catch (error) {
    console.error('Error saving chat message:', error);
    return NextResponse.json(
      { error: 'Failed to save chat message' },
      { status: 500 }
    );
  }
} 