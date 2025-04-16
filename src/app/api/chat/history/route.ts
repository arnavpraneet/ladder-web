import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const billId = searchParams.get('billId');

  if (!billId) {
    return NextResponse.json(
      { error: 'Bill ID is required' },
      { status: 400 }
    );
  }

  try {
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

    // Get chat history for the bill
    const chatHistory = await prisma.chatMessage.findMany({
      where: { billId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        message: true,
        response: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ chatHistory });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
} 