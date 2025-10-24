import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const { addressId } = await request.json()

    if (!addressId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Address ID is required' 
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

    // Get cart with items
    const carts = await sql`
      SELECT * FROM carts WHERE user_id = ${userId}
    `

    if (carts.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cart is empty' 
        },
        { status: 400 }
      )
    }

    const cart = carts[0]

    // Get cart items with product details
    const items = await sql`
      SELECT 
        ci.*,
        p.name as product_name,
        p.price as current_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ${cart.id}
    `

    if (items.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cart is empty' 
        },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.unit_price_snapshot) * item.qty)
    }, 0)

    const shippingFee = 30000 // Fixed shipping fee as specified
    const total = subtotal + shippingFee

    // Create order
    const newOrders = await sql`
      INSERT INTO orders (user_id, status, subtotal, shipping_fee, total, placed_at, updated_at)
      VALUES (${userId}, 'pending', ${subtotal}, ${shippingFee}, ${total}, NOW(), NOW())
      RETURNING *
    `

    const order = newOrders[0]

    // Create order items
    const orderItems = await Promise.all(
      items.map(item =>
        sql`
          INSERT INTO order_items (order_id, product_id, qty, unit_price, total, updated_at)
          VALUES (${order.id}, ${item.product_id}, ${item.qty}, ${item.unit_price_snapshot}, ${parseFloat(item.unit_price_snapshot) * item.qty}, NOW())
          RETURNING *
        `
      )
    )

    // Clear cart
    await sql`
      DELETE FROM cart_items WHERE cart_id = ${cart.id}
    `

    return NextResponse.json({
      success: true,
      data: {
        order,
        orderItems: orderItems.map(item => item[0])
      }
    })
  } catch (error) {
    console.error('Error during checkout:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process checkout' 
      },
      { status: 500 }
    )
  }
}
