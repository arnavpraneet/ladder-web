import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // We're now storing chat history in memory, so we always return an empty array
  // This endpoint is kept for backward compatibility
  return NextResponse.json({ chatHistory: [] });
} 