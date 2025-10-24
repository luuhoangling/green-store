import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category_id = url.searchParams.get('category_id');
  const category_name = url.searchParams.get('category_name');
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    let rows;
    if (category_id) {
      rows = await sql`SELECT id, name AS title, slug, price, sale_price AS price_sale, is_sale, stock, category_id, image_url FROM products WHERE category_id = ${Number(category_id)} LIMIT ${limit} OFFSET ${offset}`;
    } else if (category_name) {
      rows = await sql`SELECT id, name AS title, slug, price, sale_price AS price_sale, is_sale, stock, category_id, image_url FROM products WHERE category_name ILIKE ${`%${category_name}%`} LIMIT ${limit} OFFSET ${offset}`;
    } else {
      rows = await sql`SELECT id, name AS title, slug, price, sale_price AS price_sale, is_sale, stock, category_id, image_url FROM products LIMIT ${limit} OFFSET ${offset}`;
    }
    return NextResponse.json(rows);
  } catch (err) {
    console.error('by-category error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
