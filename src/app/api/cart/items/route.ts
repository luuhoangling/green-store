import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const { productId, qty } = await request.json()

    if (!productId || !qty || qty <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid product ID or quantity' 
        },
        { status: 400 }
      )
    }

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
      const newCarts = await sql`
        INSERT INTO carts (user_id, created_at, updated_at)
        VALUES (${userId}, NOW(), NOW())
        RETURNING *
      `
      cart = newCarts[0]
    } else {
      cart = carts[0]
    }

    // Get product to get current price
    const products = await sql`
      SELECT * FROM products WHERE id = ${productId}
    `

    if (products.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product not found' 
        },
        { status: 404 }
      )
    }

    const product = products[0]

    // Check if cart item already exists
    const existingItems = await sql`
      SELECT * FROM cart_items 
      WHERE cart_id = ${cart.id} AND product_id = ${productId}
    `

    let cartItem
    if (existingItems.length > 0) {
      // Update existing item
      const updatedItems = await sql`
        UPDATE cart_items 
        SET qty = ${qty}, unit_price_snapshot = ${product.price}, updated_at = NOW()
        WHERE cart_id = ${cart.id} AND product_id = ${productId}
        RETURNING *
      `
      cartItem = updatedItems[0]
    } else {
      // Create new item
      const newItems = await sql`
        INSERT INTO cart_items (cart_id, product_id, qty, unit_price_snapshot, updated_at)
        VALUES (${cart.id}, ${productId}, ${qty}, ${product.price}, NOW())
        RETURNING *
      `
      cartItem = newItems[0]
    }

    return NextResponse.json({
      success: true,
      data: {
        ...cartItem,
        product: product
      }
    })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add to cart' 
      },
      { status: 500 }
    )
  }
}
