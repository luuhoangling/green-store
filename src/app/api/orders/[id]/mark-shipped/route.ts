import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = parseInt(id)
    
    // Check authentication
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

    const { shippingProvider, trackingNumber } = await request.json()

    await sql`
      UPDATE orders 
      SET status = 'shipped', shipped_at = NOW(), shipping_provider = ${shippingProvider}, tracking_number = ${trackingNumber}
      WHERE id = ${orderId}
    `

    return NextResponse.json({
      success: true,
      message: 'Order marked as shipped'
    })
  } catch (error) {
    console.error('Error marking order as shipped:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to mark order as shipped' 
      },
      { status: 500 }
    )
  }
}
