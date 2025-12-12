import { NextRequest } from 'next/server';
import { OrderStatus } from '@/lib/types';
import { validateAuthHeader, unauthorizedResponse } from '@/lib/auth-utils';
import { supabase } from '@/lib/supabase';

// This would normally come from a database or external service
// For now, we're using the same mock data as in the main orders route
const mockOrders: Order[] = [
  {
    id: 'ord_001',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    status: 'paid',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:35:00Z',
    total_amount: 2599,
    items: [
      {
        id: 'item_001',
        clover_item_id: 'clv_123',
        name: 'Organic Coffee',
        quantity: 2,
        unit_price: 999,
        total_price: 1998,
      },
      {
        id: 'item_002',
        clover_item_id: 'clv_456',
        name: 'Croissant',
        quantity: 1,
        unit_price: 601,
        total_price: 601,
      }
    ],
    notes: 'Customer requested extra hot coffee',
  },
  {
    id: 'ord_002',
    customer_name: 'Jane Smith',
    customer_email: 'jane@example.com',
    status: 'pending',
    created_at: '2024-01-15T11:15:00Z',
    updated_at: '2024-01-15T11:15:00Z',
    total_amount: 1299,
    items: [
      {
        id: 'item_003',
        clover_item_id: 'clv_789',
        name: 'Green Tea',
        quantity: 1,
        unit_price: 599,
        total_price: 599,
      },
      {
        id: 'item_004',
        clover_item_id: 'clv_101',
        name: 'Muffin',
        quantity: 1,
        unit_price: 700,
        total_price: 700,
      }
    ],
  },
  {
    id: 'ord_003',
    customer_name: 'Bob Wilson',
    customer_email: 'bob@example.com',
    status: 'fulfilled',
    created_at: '2024-01-14T09:45:00Z',
    updated_at: '2024-01-14T10:20:00Z',
    total_amount: 3499,
    items: [
      {
        id: 'item_005',
        clover_item_id: 'clv_112',
        name: 'Sandwich',
        quantity: 1,
        unit_price: 1299,
        total_price: 1299,
      },
      {
        id: 'item_006',
        clover_item_id: 'clv_113',
        name: 'Soup',
        quantity: 1,
        unit_price: 899,
        total_price: 899,
      },
      {
        id: 'item_007',
        clover_item_id: 'clv_114',
        name: 'Side Salad',
        quantity: 1,
        unit_price: 699,
        total_price: 699,
      },
      {
        id: 'item_008',
        clover_item_id: 'clv_115',
        name: 'Drink',
        quantity: 1,
        unit_price: 602,
        total_price: 602,
      }
    ],
    notes: 'Lunch combo order',
  },
  {
    id: 'ord_004',
    customer_name: 'Alice Johnson',
    customer_email: 'alice@example.com',
    status: 'canceled',
    created_at: '2024-01-13T14:20:00Z',
    updated_at: '2024-01-13T14:25:00Z',
    total_amount: 899,
    items: [
      {
        id: 'item_009',
        clover_item_id: 'clv_116',
        name: 'Espresso',
        quantity: 2,
        unit_price: 449,
        total_price: 898,
      }
    ],
    notes: 'Customer canceled due to wait time',
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAuthHeader(request)) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error fetching order:', error);
      // Fall back to mock order on error
      const order = mockOrders.find(o => o.id === id);
      if (order) {
        return Response.json(order);
      }
      return new Response('Order not found', { status: 404 });
    }

    if (!data) {
      return new Response('Order not found', { status: 404 });
    }

    return Response.json(data);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    // Fall back to mock order
    const order = mockOrders.find(o => o.id === id);
    if (order) {
      return Response.json(order);
    }
    return new Response('Order not found', { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAuthHeader(request)) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    const updates = await request.json();
    
    // Only allow status updates for now
    if (!updates.status || !['pending', 'paid', 'fulfilled', 'canceled'].includes(updates.status)) {
      return new Response('Invalid update data', { status: 400 });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: updates.status as OrderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating order:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      return new Response('Order not found', { status: 404 });
    }

    return Response.json(data);
  } catch (error) {
    console.error('Failed to update order:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update order' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}