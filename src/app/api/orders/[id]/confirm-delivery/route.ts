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

    await sql`
      UPDATE orders 
      SET status = 'delivered', delivered_at = NOW()
      WHERE id = ${orderId}
    `

    return NextResponse.json({
      success: true,
      message: 'Order marked as delivered'
    })
  } catch (error) {
    console.error('Error confirming delivery:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to confirm delivery' 
      },
      { status: 500 }
    )
  }
}
