import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const idsParam = url.searchParams.get('ids') || '';
  const ids = idsParam.split(',').map((s) => Number(s)).filter((n) => !Number.isNaN(n));
  if (ids.length === 0) {
    return NextResponse.json({ error: 'no ids' }, { status: 400 });
  }

  try {
    const rows = await sql`SELECT id, name AS title, slug, price, sale_price AS price_sale, is_sale, stock, category_id, image_url FROM products WHERE id = ANY(${ids})`;
    return NextResponse.json(rows);
  } catch (err) {
    console.error('compare error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
