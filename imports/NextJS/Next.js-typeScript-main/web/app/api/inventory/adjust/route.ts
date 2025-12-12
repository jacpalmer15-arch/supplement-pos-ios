import { NextRequest } from 'next/server';
import type { InventoryAdjustment, InventoryAdjustmentResponse } from '@/lib/types';
import { createBackendHeaders, validateAuthHeader, unauthorizedResponse } from '@/lib/auth-utils';

const BASE = process.env.BACKEND_BASE!;

export async function POST(request: NextRequest) {
  try {
    // Validate authentication first
    if (!validateAuthHeader(request)) {
      return unauthorizedResponse();
    }

    const body: InventoryAdjustment = await request.json();
    
    // Validate required fields
    if (!body.clover_item_id || typeof body.adjustment !== 'number') {
      return Response.json(
        { success: false, message: 'Missing required fields: clover_item_id and adjustment' },
        { status: 400 }
      );
    }

    // If no backend is configured, simulate successful adjustment
    if (!BASE) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response: InventoryAdjustmentResponse = {
        success: true,
        message: `Inventory adjusted successfully. ${body.adjustment > 0 ? 'Added' : 'Removed'} ${Math.abs(body.adjustment)} units.`,
      };
      return Response.json(response);
    }

    // Forward to backend service
    const upstream = await fetch(`${BASE}/api/inventory/adjust`, {
      method: 'POST',
      headers: createBackendHeaders(request),
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const text = await upstream.text();
    
    if (!upstream.ok) {
      return Response.json(
        { success: false, message: `Backend error: ${text}` },
        { status: upstream.status }
      );
    }

    try {
      const json = JSON.parse(text);
      const response: InventoryAdjustmentResponse = {
        success: json.success ?? true,
        new_quantity: typeof json.new_quantity === 'number' ? json.new_quantity : undefined,
        message: json.message ?? 'Inventory adjusted successfully',
      };
      return Response.json(response);
    } catch {
      return Response.json({
        success: true,
        message: 'Inventory adjusted successfully',
      });
    }
  } catch (error) {
    return Response.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}