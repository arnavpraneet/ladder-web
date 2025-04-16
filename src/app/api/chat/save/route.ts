import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // This endpoint now just acknowledges requests without saving to database
  // It's kept for backward compatibility
  return NextResponse.json({ 
    success: true,
    messageId: `temp-${Date.now()}`
  });
} 