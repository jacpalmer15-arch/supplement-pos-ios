
import { InventoryRow } from '@/lib/types';

import { createBackendHeaders, validateAuthHeader, unauthorizedResponse } from '@/lib/auth-utils';
import { NextRequest } from 'next/server';

const BASE = process.env.BACKEND_BASE;

// Mock inventory data
const mockInventoryData: InventoryRow[] = [
  {
    clover_item_id: 'clv_001',
    name: 'Organic Coffee Beans',
    on_hand: 15,
    reorder_level: 25,
  },
  {
    clover_item_id: 'clv_002',
    name: 'Almond Milk',
    on_hand: 8,
    reorder_level: 20,
  },
  {
    clover_item_id: 'clv_003',
    name: 'Croissants',
    on_hand: 45,
    reorder_level: 10,
  }
];

function toNumber(v: unknown, def = 0): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : def;
}

function toNullableNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeRow(x: Record<string, unknown>): InventoryRow {
  const on_hand = toNumber(x?.on_hand ?? x?.quantity ?? 0, 0);
  const reorder_level = toNullableNumber(x?.reorder_level ?? x?.min ?? null);
  return {
    clover_item_id: String(x?.clover_item_id ?? x?.id ?? x?.itemId ?? x?.upc ?? ''),
    name: x?.name ? String(x.name) : x?.product_name ? String(x.product_name) : null,
    on_hand,
    reorder_level,
  };
}

export async function GET(req: NextRequest) {
  // Return mock data if no backend base is configured
  if (!BASE) {
    return Response.json(mockInventoryData);
  }

  // Validate authentication
  if (!validateAuthHeader(req)) {
    return unauthorizedResponse();
  }

  try {
    const upstream = await fetch(`${BASE}/api/inventory`, { 
      cache: 'no-store',
      headers: createBackendHeaders(req)
    });
    const text = await upstream.text();
    if (!upstream.ok) return new Response(text, { status: upstream.status });

    const json: unknown = JSON.parse(text);
    const arr = Array.isArray(json) ? json : Array.isArray((json as Record<string, unknown>)?.data) ? (json as Record<string, unknown>).data : [];
    const rows = (arr as Record<string, unknown>[]).map(normalizeRow);
    return Response.json(rows);
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return Response.json(mockInventoryData);
  }
}
