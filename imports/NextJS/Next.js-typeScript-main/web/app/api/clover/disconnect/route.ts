import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // In production, this would reset the connection in the database
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to disconnect from Clover' },
      { status: 500 }
    );
  }
}