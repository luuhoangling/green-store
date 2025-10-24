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

    // Check if user is admin (from token or database)
    const isAdmin = user.role === 'admin'
    
    if (!isAdmin) {
      // Double check in database
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

    // Get all orders with user and item details
    const orders = await sql`
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.placed_at DESC
    `

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await sql`
          SELECT 
            oi.id,
            oi.qty,
            oi.unit_price,
            oi.total,
            p.id as product_id,
            p.name as product_name
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ${order.id}
        `

        return {
          id: order.id,
          status: order.status,
          subtotal: order.subtotal,
          shipping_fee: order.shipping_fee,
          total: order.total,
          placed_at: order.placed_at,
          paid_at: order.paid_at,
          shipped_at: order.shipped_at,
          delivered_at: order.delivered_at,
          cancelled_at: order.cancelled_at,
          payment_proof_url: order.payment_proof_url,
          shipping_provider: order.shipping_provider,
          tracking_number: order.tracking_number,
          user: {
            id: order.user_id,
            name: order.user_name,
            email: order.user_email
          },
          items: items.map(item => ({
            id: item.id,
            qty: item.qty,
            unit_price: item.unit_price,
            total: item.total,
            product: {
              id: item.product_id,
              name: item.product_name
            }
          }))
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: ordersWithItems
    })
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders' 
      },
      { status: 500 }
    )
  }
}
