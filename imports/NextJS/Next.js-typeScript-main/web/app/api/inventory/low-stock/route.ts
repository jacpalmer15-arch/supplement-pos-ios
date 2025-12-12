import type { InventoryRow } from '@/lib/types';
import { mockInventoryData } from '@/lib/mock-data';
import { NextRequest } from 'next/server';
import { createBackendHeaders, validateAuthHeader, unauthorizedResponse } from '@/lib/auth-utils';

const BASE = process.env.BACKEND_BASE!;

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
    const lowStockItems = mockInventoryData.filter((item) => {
      const reorderLevel = item.reorder_level ?? 0;
      return item.on_hand <= reorderLevel;
    });
    return Response.json(lowStockItems.map(item => ({ ...item, low_stock: true })));
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

    try {
      const json = JSON.parse(text);
      const arr = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
      const rows: InventoryRow[] = arr.map(normalizeRow);

      const low = rows.filter((r) => {
        const rl = r.reorder_level ?? 0;
        return r.on_hand - rl <= 0;
      });

      return Response.json(low.map((r) => ({ ...r, low_stock: true })));
    } catch {
      return Response.json([]);
    }
  } catch {
    // Fallback to mock data if backend is not available
    const lowStockItems = mockInventoryData.filter((item) => {
      const reorderLevel = item.reorder_level ?? 0;
      return item.on_hand <= reorderLevel;
    });
    return Response.json(lowStockItems.map(item => ({ ...item, low_stock: true })));
  }
}
