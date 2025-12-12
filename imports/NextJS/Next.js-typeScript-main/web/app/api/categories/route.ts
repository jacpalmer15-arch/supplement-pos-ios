import { NextRequest } from 'next/server';
import { createBackendHeaders, validateAuthHeader, unauthorizedResponse } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  if (!validateAuthHeader(req)) {
    return unauthorizedResponse();
  }

  const res = await fetch(`${process.env.BACKEND_BASE}/api/categories`, {
    cache: 'no-store',
    headers: createBackendHeaders(req),
  });
  const text = await res.text();
  if (!res.ok) return Response.json([]);

  try {
    const parsed = JSON.parse(text);
    // Defensive: always return an array
    const categories = Array.isArray(parsed.data) ? parsed.data : [];
    return Response.json(categories);
  } catch {
    return Response.json([]);
  }
}