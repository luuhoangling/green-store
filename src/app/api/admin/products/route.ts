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

    // Get all products with category information
    const products = await sql`
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
      ORDER BY p.created_at DESC
    `

    return NextResponse.json({
      success: true,
      data: products
    })
  } catch (error) {
    console.error('Error fetching admin products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products' 
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
    const { name, description, price, categoryId, imageUrl, stock, brand, salePrice } = body

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Convert categoryId to number or null
    const categoryIdNum = categoryId && categoryId !== '' ? parseInt(categoryId, 10) : null

    // Insert new product
    const result = await sql`
      INSERT INTO products (name, slug, description, price, category_id, image_url, stock, brand, sale_price, is_active, created_at)
      VALUES (${name}, ${slug}, ${description}, ${price}, ${categoryIdNum}, ${imageUrl}, ${stock}, ${brand}, ${salePrice}, true, NOW())
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      data: result[0]
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product' 
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
    const { id, name, description, price, categoryId, imageUrl, stock, brand, salePrice } = body

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Convert categoryId to number or null
    const categoryIdNum = categoryId && categoryId !== '' ? parseInt(categoryId, 10) : null

    // Update product
    const result = await sql`
      UPDATE products 
      SET 
        name = ${name},
        slug = ${slug},
        description = ${description},
        price = ${price},
        category_id = ${categoryIdNum},
        image_url = ${imageUrl},
        stock = ${stock},
        brand = ${brand},
        sale_price = ${salePrice},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update product' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const { id } = body

    // Delete product
    const result = await sql`
      DELETE FROM products 
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete product' 
      },
      { status: 500 }
    )
  }
}
