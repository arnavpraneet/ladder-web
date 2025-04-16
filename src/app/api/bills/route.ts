import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    // Get bills with pagination
    const bills = await prisma.bill.findMany({
      skip,
      take: limit,
      orderBy: {
        publicationDate: 'desc',
      },
    });

    // Get total count for pagination
    const totalBills = await prisma.bill.count();
    const totalPages = Math.ceil(totalBills / limit);

    return NextResponse.json({
      bills,
      pagination: {
        page,
        limit,
        totalBills,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
} 