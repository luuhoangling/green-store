import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    // prefer a promotions table if exists, otherwise products with is_sale
    const rows = await sql`SELECT id, name AS title, slug, price, sale_price AS price_sale, is_sale, stock, category_id, image_url FROM products WHERE is_sale = true LIMIT ${limit} OFFSET ${offset}`;
    return NextResponse.json(rows);
  } catch (err) {
    console.error('promotions error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
