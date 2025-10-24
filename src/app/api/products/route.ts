import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { buildVietnameseSearchConditions, generateVietnameseSearchVariations } from '@/lib/vietnamese-utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    let q = searchParams.get('q')
    const sortBy = searchParams.get('sortBy') || 'price_asc'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const brand = searchParams.get('brand')
    const inStock = searchParams.get('inStock')
    const onSale = searchParams.get('sale')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')
    const skip = (page - 1) * pageSize

    // Clean and normalize search query with Vietnamese support
    if (q) {
      q = q.trim()
      // Generate search variations for better Vietnamese support
      const searchVariations = generateVietnameseSearchVariations(q)
      console.log('Search variations:', searchVariations)
    }

    // Build sort clause
    let orderBy = 'p.price ASC'
    switch (sortBy) {
      case 'price_asc':
        orderBy = 'p.price ASC'
        break
      case 'price_desc':
        orderBy = 'p.price DESC'
        break
      case 'name_asc':
        orderBy = 'p.name ASC'
        break
      case 'name_desc':
        orderBy = 'p.name DESC'
        break
      default:
        orderBy = 'p.price ASC'
    }

    // Build WHERE conditions
    const buildWhereConditions = () => {
      const conditions = ['p.is_active = true']
      
      if (category) {
        conditions.push(`p.category_id = ${parseInt(category)}`)
      }
      
      if (q) {
        // Use Vietnamese search conditions for better support - only search by name
        const searchConditions = buildVietnameseSearchConditions(q, ['p.name'])
        if (searchConditions) {
          conditions.push(searchConditions)
        }
      }
      
      if (minPrice) {
        conditions.push(`p.price >= ${parseInt(minPrice)}`)
      }
      
      if (maxPrice) {
        conditions.push(`p.price <= ${parseInt(maxPrice)}`)
      }
      
      if (brand) {
        conditions.push(`LOWER(p.brand) = LOWER('${brand}')`)
      }
      
      if (inStock === 'true') {
        conditions.push(`p.stock > 0`)
      }
      
      if (onSale === 'true') {
        conditions.push(`p.is_sale = true`)
      }
      
      return conditions.join(' AND ')
    }

    const whereConditions = buildWhereConditions()


    // Get products with pagination
    const products = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${sql.unsafe(whereConditions)}
      ORDER BY ${sql.unsafe(orderBy)}
      LIMIT ${pageSize} OFFSET ${skip}
    `

    // Get total count
    const totalResult = await sql`
      SELECT COUNT(*) as total
      FROM products p
      WHERE ${sql.unsafe(whereConditions)}
    `
    const total = parseInt(totalResult[0]?.total || '0')

    // Map database fields to frontend format
    const mappedProducts = products.map(product => ({
      ...product,
      imageUrl: product.image_url,
      salePrice: product.sale_price,
      isSale: product.is_sale || false,
      stock: product.stock || 0,
      category: {
        id: product.category_id,
        name: product.category_name,
        slug: product.category_slug
      }
    }))

    return NextResponse.json({
      success: true,
      data: mappedProducts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products' 
      },
      { status: 500 }
    )
  }
}
