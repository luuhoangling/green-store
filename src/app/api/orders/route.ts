import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
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

    const orders = await sql`
      SELECT * FROM orders 
      WHERE user_id = ${userId}
      ORDER BY placed_at DESC
    `

    return NextResponse.json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders' 
      },
      { status: 500 }
    )
  }
}
