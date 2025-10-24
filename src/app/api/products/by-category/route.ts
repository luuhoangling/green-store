import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Hỗ trợ cả categoryId và category_id
  const category_id = url.searchParams.get('categoryId') || url.searchParams.get('category_id');
  const category_name = url.searchParams.get('category_name');
  const page = Number(url.searchParams.get('page')) || 1;
  // Cho phép tùy chỉnh limit từ query params
  const limit = Number(url.searchParams.get('limit')) || 10;
  const offset = (page - 1) * limit;

  try {
    let rows;
    if (category_id) {
      rows = await sql`
        SELECT 
          id, 
          name, 
          slug, 
          brand,
          description,
          price, 
          sale_price AS "salePrice", 
          is_sale AS "isSale", 
          stock, 
          category_id, 
          image_url AS "imageUrl"
        FROM products 
        WHERE category_id = ${Number(category_id)} 
        LIMIT ${limit} 
        OFFSET ${offset}
      `;
    } else if (category_name) {
      rows = await sql`
        SELECT 
          id, 
          name, 
          slug, 
          brand,
          description,
          price, 
          sale_price AS "salePrice", 
          is_sale AS "isSale", 
          stock, 
          category_id, 
          image_url AS "imageUrl"
        FROM products 
        WHERE category_name ILIKE ${`%${category_name}%`} 
        LIMIT ${limit} 
        OFFSET ${offset}
      `;
    } else {
      rows = await sql`
        SELECT 
          id, 
          name, 
          slug, 
          brand,
          description,
          price, 
          sale_price AS "salePrice", 
          is_sale AS "isSale", 
          stock, 
          category_id, 
          image_url AS "imageUrl"
        FROM products 
        LIMIT ${limit} 
        OFFSET ${offset}
      `;
    }
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error('by-category error', err);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}
