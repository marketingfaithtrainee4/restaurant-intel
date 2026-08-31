import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        is_managed: true,
        name: body.name,
        cuisine_type: body.cuisine_type || null,
        website_url: body.website_url || null,
        menu_url: body.menu_url || null,
        gbp_url: body.gbp_url || null,
        google_review_url: body.google_review_url || null,
        address_line: body.address_line || null,
        postcode: body.postcode || null,
        phone: body.phone || null,
        facebook_url: body.facebook_url || null,
        instagram_url: body.instagram_url || null,
        ordering_provider: body.ordering_provider || null,
        ordering_url: body.ordering_url || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ business: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}