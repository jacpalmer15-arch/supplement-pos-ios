import { NextRequest, NextResponse } from 'next/server';
import { validateAuthHeader, unauthorizedResponse } from '@/lib/auth-utils';
import { Transaction } from '@/lib/types';
import { supabase } from '@/lib/supabase';

// Mock data for transactions when database is unavailable
const mockTransactions: Transaction[] = [
  {
    id: 'txn_001',
    merchant_id: null,
    device_id: null,
    external_id: 'ord_001',
    clover_order_id: 'clv_ord_123',
    clover_payment_id: 'clv_pay_456',
    subtotal_cents: 2299,
    tax_cents: 300,
    discount_cents: 0,
    total_cents: 2599,
    payment_method: 'CARD',
    status: 'COMPLETED',
    completed_at: '2024-01-15T10:35:00Z',
    created_at: '2024-01-15T10:30:00Z',
    order_from_sc: false,
  },
];

// POST is handled by /api/checkout endpoint - this endpoint is only for GET

export async function GET(request: NextRequest) {
  if (!validateAuthHeader(request)) {
    return unauthorizedResponse();
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');

    console.log('Fetching transactions from Supabase with filters:', { status, from_date, to_date });

    // Build Supabase query for transactions with line items
    let query = supabase
      .from('transactions')
      .select('*, transaction_items(*)')
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status.toUpperCase());
    }
    if (from_date) {
      query = query.gte('created_at', from_date);
    }
    if (to_date) {
      query = query.lte('created_at', to_date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching transactions:', error);
      return NextResponse.json({
        success: false,
        message: error.message,
        transactions: mockTransactions,
        count: mockTransactions.length
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transactions: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json({
      success: true,
      transactions: mockTransactions,
      count: mockTransactions.length,
      message: 'Using mock data - error occurred'
    });
  }
}
