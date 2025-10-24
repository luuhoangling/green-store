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

    // Get all users with order statistics
    const users = await sql`
      SELECT 
        u.*,
        COALESCE(order_stats.total_orders, 0) as total_orders,
        COALESCE(order_stats.total_spent, 0) as total_spent
      FROM users u
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(*) as total_orders,
          SUM(total) as total_spent
        FROM orders 
        WHERE status != 'cancelled'
        GROUP BY user_id
      ) order_stats ON u.id = order_stats.user_id
      ORDER BY u.created_at DESC
    `

    return NextResponse.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users' 
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
    const { userId, status, role } = body

    // Update user status or role
    if (status && role) {
      // Update both status and role
      const result = await sql`
        UPDATE users 
        SET status = ${status}, role = ${role}, updated_at = NOW()
        WHERE id = ${userId}
        RETURNING *
      `
      return NextResponse.json({
        success: true,
        data: result[0]
      })
    } else if (status) {
      // Update only status
      const result = await sql`
        UPDATE users 
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${userId}
        RETURNING *
      `
      return NextResponse.json({
        success: true,
        data: result[0]
      })
    } else if (role) {
      // Update only role
      const result = await sql`
        UPDATE users 
        SET role = ${role}, updated_at = NOW()
        WHERE id = ${userId}
        RETURNING *
      `
      return NextResponse.json({
        success: true,
        data: result[0]
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No fields to update' 
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user' 
      },
      { status: 500 }
    )
  }
}
