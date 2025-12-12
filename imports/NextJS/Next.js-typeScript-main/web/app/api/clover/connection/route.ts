import { NextResponse } from 'next/server';
import type { CloverConnection } from '@/lib/types';

// Mock storage - in production, this would be stored in a database
const mockCloverConnection: CloverConnection = {
  isConnected: false,
};

export async function GET() {
  return NextResponse.json(mockCloverConnection);
}