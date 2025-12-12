import { NextRequest, NextResponse } from 'next/server';
import type { CloverConnection } from '@/lib/types';

// Mock storage - in production, this would be stored in a database
let mockCloverConnection: CloverConnection = {
  isConnected: false,
};

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    
    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Mock connection logic - in production, validate with Clover API
    if (apiKey.length < 10) {
      return NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 400 }
      );
    }

    // Simulate successful connection
    mockCloverConnection = {
      isConnected: true,
      merchantId: 'MERCHANT_' + Math.random().toString(36).substring(7).toUpperCase(),
      lastSyncAt: new Date(),
      apiKey: apiKey.substring(0, 8) + '...' // Store masked version
    };

    return NextResponse.json(mockCloverConnection);
  } catch {
    return NextResponse.json(
      { error: 'Failed to connect to Clover' },
      { status: 500 }
    );
  }
}