import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const idNum = Number(id);
  
  if (!id || Number.isNaN(idNum)) {
    return NextResponse.json({ error: 'valid id required' }, { status: 400 });
  }

  try {
    const rows = await sql`SELECT id, name AS title, slug, price, sale_price AS price_sale, is_sale, stock, category_id, image_url FROM products WHERE id = ${idNum} LIMIT 1`;
    const product = rows[0] || null;
    return NextResponse.json(product);
  } catch (err) {
    console.error('get product error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
