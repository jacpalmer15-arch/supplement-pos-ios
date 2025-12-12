import { NextRequest } from 'next/server';
import { createBackendHeaders, validateAuthHeader, unauthorizedResponse } from '@/lib/auth-utils';

const BASE = process.env.BACKEND_BASE!;
const SYNC_TIMEOUT_MS = Number(process.env.SYNC_TIMEOUT_MS ?? 600000);

export async function POST(request: NextRequest) {
  // Validate authentication
  if (!validateAuthHeader(request)) {
    return unauthorizedResponse();
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${BASE}/api/products/sync`, {
      method: 'POST',
      headers: createBackendHeaders(request),
      signal: controller.signal,
      cache: 'no-store',
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  } catch (e: unknown) {
    const err = e as Error;
    const isTimeout = err?.name === 'AbortError';
    const msg = isTimeout
      ? `Product sync timed out after ${SYNC_TIMEOUT_MS / 1000} seconds (${SYNC_TIMEOUT_MS / 60000} minutes). The backend may still be processing.`
      : (err?.message || 'Upstream sync failed');
    
    console.error('Product sync error:', err);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: msg,
      timeout: isTimeout,
      details: err?.message 
    }), {
      status: isTimeout ? 504 : 502,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    clearTimeout(t);
  }
}
