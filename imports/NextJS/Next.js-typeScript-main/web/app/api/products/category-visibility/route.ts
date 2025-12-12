import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const categoryId = body?.category_id;
    const visible = body?.visible_in_kiosk;

    if (typeof categoryId !== 'string' || !categoryId.trim()) {
      return new Response('category_id is required', { status: 400 });
    }

    if (typeof visible !== 'boolean') {
      return new Response('visible_in_kiosk must be a boolean', { status: 400 });
    }

    const { data, error } = await supabase
      .from('products')
      .update({ visible_in_kiosk: visible })
      .eq('category_id', categoryId)
      .select('clover_item_id');

    if (error) {
      console.error('Category visibility update failed:', error);
      return new Response(`Database error: ${error.message}`, { status: 500 });
    }

    return Response.json({
      success: true,
      updated: data?.length ?? 0,
      category_id: categoryId,
      visible_in_kiosk: visible,
    });
  } catch (error) {
    console.error('Category visibility API errored:', error);
    return new Response('Invalid request body', { status: 400 });
  }
}
