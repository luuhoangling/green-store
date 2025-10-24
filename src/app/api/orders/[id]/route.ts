import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = parseInt(id)

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

    // Get order details
    const orders = await sql`
      SELECT * FROM orders 
      WHERE id = ${orderId} AND user_id = ${userId}
    `

    if (orders.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order not found or access denied' 
        },
        { status: 404 }
      )
    }

    const order = orders[0]

    // Get order items with product details
    const items = await sql`
      SELECT 
        oi.id,
        oi.qty,
        oi.unit_price,
        oi.total,
        p.id as product_id,
        p.name as product_name,
        p.slug as product_slug,
        p.image_url as product_image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${orderId}
    `

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        items: items.map(item => ({
          id: item.id,
          qty: item.qty,
          unit_price: item.unit_price,
          total: item.total,
          product: {
            id: item.product_id,
            name: item.product_name,
            slug: item.product_slug,
            image_url: item.product_image_url
          }
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch order details' 
      },
      { status: 500 }
    )
  }
}
