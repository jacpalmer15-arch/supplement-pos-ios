import { NextRequest, NextResponse } from 'next/server';
import { createBackendHeaders, validateAuthHeader, unauthorizedResponse } from '@/lib/auth-utils';

const BASE = process.env.BACKEND_BASE;

export async function POST(request: NextRequest) {
  if (!validateAuthHeader(request)) {
    return unauthorizedResponse();
  }

  const body = await request.text();

  if (!BASE) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Backend not configured. Please set BACKEND_BASE environment variable.' 
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    console.log('Forwarding checkout request to:', `${BASE}/api/checkout`);
    
    const upstream = await fetch(`${BASE}/api/checkout`, {
      method: 'POST',
      headers: createBackendHeaders(request),
      body,
      cache: 'no-store',
    });

    const text = await upstream.text();
    
    console.log('Backend response status:', upstream.status);
    console.log('Backend response:', text);

    // If backend returned an error status, try to parse and forward it
    if (!upstream.ok) {
      try {
        const errorData = JSON.parse(text);
        return NextResponse.json(
          { success: false, message: errorData.message || 'Backend error', ...errorData },
          { status: upstream.status }
        );
      } catch {
        return NextResponse.json(
          { success: false, message: text || 'Backend error' },
          { status: upstream.status }
        );
      }
    }

    return new Response(text, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  } catch (error) {
    console.error('Failed to forward /api/checkout to upstream:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to connect to backend checkout service',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 502 }
    );
  }
}
