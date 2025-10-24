import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const excludeId = searchParams.get('excludeId')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build WHERE conditions
    let whereConditions = 'p.is_active = true'
    if (excludeId) {
      whereConditions += ` AND p.id != ${parseInt(excludeId)}`
    }

    // Get random products
    const products = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${sql.unsafe(whereConditions)}
      ORDER BY RANDOM()
      LIMIT ${limit}
    `

    // Map database fields to frontend format
    const mappedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      description: product.description,
      price: product.price,
      salePrice: product.sale_price,
      isSale: product.is_sale || false,
      stock: product.stock || 0,
      imageUrl: product.image_url,
      category: {
        id: product.category_id,
        name: product.category_name,
        slug: product.category_slug
      }
    }))

    return NextResponse.json({
      success: true,
      data: mappedProducts
    })
  } catch (error) {
    console.error('Error fetching related products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch related products' 
      },
      { status: 500 }
    )
  }
}
