import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdmin = user.role === 'admin'
    
    if (!isAdmin) {
      const dbUser = await sql`
        SELECT is_admin FROM users WHERE id = ${user.userId}
      `
      
      if (dbUser.length === 0 || !dbUser[0].is_admin) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Admin access required' 
          },
          { status: 403 }
        )
      }
    }

    // Get all products that are on sale (is_sale = true)
    // First, let's check if the products table exists and has the required columns
    try {
      const promotions = await sql`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.sale_price,
          p.is_sale,
          p.category_id,
          p.image_url,
          p.stock,
          p.is_active,
          p.created_at,
          c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_sale = true
        ORDER BY p.created_at DESC
      `

      return NextResponse.json({
        success: true,
        data: promotions || []
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      
      // If there's a database error, return empty array instead of failing
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No products on sale found or database error'
      })
    }
  } catch (error) {
    console.error('Error fetching admin promotions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch promotions' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdmin = user.role === 'admin'
    
    if (!isAdmin) {
      const dbUser = await sql`
        SELECT is_admin FROM users WHERE id = ${user.userId}
      `
      
      if (dbUser.length === 0 || !dbUser[0].is_admin) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Admin access required' 
          },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const { 
      productId, 
      salePrice
    } = body

    // Update product to set it on sale
    const result = await sql`
      UPDATE products 
      SET 
        is_sale = true,
        sale_price = ${salePrice}
      WHERE id = ${productId}
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      data: result[0]
    })
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create promotion' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdmin = user.role === 'admin'
    
    if (!isAdmin) {
      const dbUser = await sql`
        SELECT is_admin FROM users WHERE id = ${user.userId}
      `
      
      if (dbUser.length === 0 || !dbUser[0].is_admin) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Admin access required' 
          },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const { productId, isSale } = body

    // Update product sale status
    const result = await sql`
      UPDATE products 
      SET is_sale = ${isSale}
      WHERE id = ${productId}
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      data: result[0]
    })
  } catch (error) {
    console.error('Error updating promotion:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update promotion' 
      },
      { status: 500 }
    )
  }
}
