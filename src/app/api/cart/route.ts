import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from token
    const userId = getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      )
    }

    // Get or create cart
    let carts = await sql`
      SELECT * FROM carts WHERE user_id = ${userId}
    `

    let cart
    if (carts.length === 0) {
      // Create cart if it doesn't exist
      const newCarts = await sql`
        INSERT INTO carts (user_id, created_at, updated_at)
        VALUES (${userId}, NOW(), NOW())
        RETURNING *
      `
      cart = newCarts[0]
    } else {
      cart = carts[0]
    }

    // Get cart items with product details
    const items = await sql`
      SELECT 
        ci.id,
        ci.qty,
        ci.unit_price_snapshot,
        p.id as product_id,
        p.name as product_name,
        p.slug as product_slug,
        p.image_url as product_image_url,
        p.price as current_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ${cart.id}
    `

    // Debug: Log the items to see what we're getting
    console.log('Cart items from DB:', items)

    return NextResponse.json({
      success: true,
      data: {
        ...cart,
        items: items.map(item => ({
          id: item.id,
          qty: item.qty,
          unitPriceSnapshot: item.unit_price_snapshot || item.current_price, // Fallback to current price if snapshot is null
          product: {
            id: item.product_id,
            name: item.product_name,
            slug: item.product_slug,
            imageUrl: item.product_image_url,
            price: item.current_price
          }
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch cart' 
      },
      { status: 500 }
    )
  }
}
