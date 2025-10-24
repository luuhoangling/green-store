import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

const QuerySchema = z.object({
  q: z.string().optional(),
  category_id: z.string().optional(),
  category_name: z.string().optional(),
  price_min: z.coerce.number().optional(),
  price_max: z.coerce.number().optional(),
  in_stock_only: z.coerce.boolean().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = Object.fromEntries(url.searchParams.entries());
  const parsed = QuerySchema.parse(raw);

  const limit = 10;
  const offset = ((parsed.page || 1) - 1) * limit;

  try {
    // Build dynamic query using Neon template syntax
    let rows;
    
    // Simple search without complex parameterization
    if (parsed.q) {
      const searchTerm = `%${parsed.q}%`;
      rows = await sql`
        SELECT id, name AS title, slug, price, sale_price AS price_sale, is_sale, stock, category_id, image_url 
        FROM products 
        WHERE name ILIKE ${searchTerm}
        ${parsed.category_id ? sql`AND category_id = ${Number(parsed.category_id)}` : sql``}
        ${parsed.price_min != null ? sql`AND price >= ${parsed.price_min}` : sql``}
        ${parsed.price_max != null ? sql`AND price <= ${parsed.price_max}` : sql``}
        ${parsed.in_stock_only ? sql`AND stock > 0` : sql``}
        ORDER BY id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      rows = await sql`
        SELECT id, name AS title, slug, price, sale_price AS price_sale, is_sale, stock, category_id, image_url 
        FROM products 
        WHERE 1=1
        ${parsed.category_id ? sql`AND category_id = ${Number(parsed.category_id)}` : sql``}
        ${parsed.price_min != null ? sql`AND price >= ${parsed.price_min}` : sql``}
        ${parsed.price_max != null ? sql`AND price <= ${parsed.price_max}` : sql``}
        ${parsed.in_stock_only ? sql`AND stock > 0` : sql``}
        ORDER BY id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    
    return NextResponse.json(rows);
  } catch (err) {
    console.error('search error', err);
    return NextResponse.json({ error: 'search failed' }, { status: 500 });
  }
}
