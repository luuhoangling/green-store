import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = Number(url.searchParams.get('productId')) || 0;
  const limit = Number(url.searchParams.get('limit')) || 5;
  if (!productId) return NextResponse.json([], { status: 200 });

  try {
    const p = await sql`SELECT category_id FROM products WHERE id = ${productId} LIMIT 1`;
    const cat = p[0]?.category_id;
    if (!cat) return NextResponse.json([], { status: 200 });
    const rows = await sql`SELECT id, name AS title, slug, price, sale_price AS price_sale, is_sale, stock, category_id, image_url FROM products WHERE category_id = ${cat} AND id <> ${productId} LIMIT ${limit}`;
    return NextResponse.json(rows);
  } catch (err) {
    console.error('similar error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
