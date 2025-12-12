import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Product, ApiProduct } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('clover_item_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return new Response('Product not found', { status: 404 });
      }
      console.error('Supabase error:', error);
      return new Response(`Database error: ${error.message}`, { status: 500 });
    }

    // Transform data from database Product format to ApiProduct format
    const product: ApiProduct = {
      clover_item_id: data.clover_item_id || '',
      name: data.name || 'Unnamed',
      category_id: data.category_id || null, // Map category to category_id
      sku: data.sku || null,
      upc: data.upc || null,
      visible_in_kiosk: data.visible_in_kiosk || false,
      price_cents: data.price_cents || null, // Map price to price_cents
      cost_cents: data.cost_cents || null, // Map cost to cost_cents
    };

    return Response.json(product);
  } catch (err) {
    console.error('Product GET error:', err);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {    
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    
    // Prepare update object, ensuring only valid database Product fields are updated
    const updateData: Partial<Omit<Product, 'clover_item_id'>> = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.category_id !== undefined) updateData.category_id = body.category_id;    
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.upc !== undefined) updateData.upc = body.upc;
    if (body.visible_in_kiosk !== undefined) updateData.visible_in_kiosk = body.visible_in_kiosk;
    if (body.price_cents !== undefined) updateData.price_cents = Number(body.price_cents); // Map price_cents to price
    if (body.cost_cents !== undefined) updateData.cost_cents = Number(body.cost_cents); // Map cost_cents to cost

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('clover_item_id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return new Response('Product not found', { status: 404 });
      }
      console.error('Supabase update error:', error);
      return new Response(`Database error: ${error.message}`, { status: 500 });
    }

    // Return normalized product data in ApiProduct format
    const product: ApiProduct = {
      clover_item_id: data.clover_item_id || '',
      name: data.name || 'Unnamed',
      category_id: data.category_id || null, // Map category to category_id
      sku: data.sku || null,
      upc: data.upc || null,
      visible_in_kiosk: data.visible_in_kiosk || false,
      price_cents: data.price_cents || null, // Map price to price_cents
      cost_cents: data.cost_cents || null, // Map cost to cost_cents
    };

    return Response.json(product);
  } catch (err) {
    console.error('Product PATCH error:', err);
    return new Response('Internal server error', { status: 500 });
  }
}