import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth-utils'

export async function POST(
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

    // Check if order exists and belongs to user
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

    // Check if order can be cancelled (only pending orders)
    if (order.status !== 'pending') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Chỉ có thể hủy đơn hàng đang chờ xử lý' 
        },
        { status: 400 }
      )
    }

    // Update order status to cancelled
    await sql`
      UPDATE orders 
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ${orderId}
    `

    return NextResponse.json({
      success: true,
      message: 'Đơn hàng đã được hủy thành công'
    })
  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel order' 
      },
      { status: 500 }
    )
  }
}