import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth-utils'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cartItemId = parseInt(id)

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

    // Verify the cart item belongs to the user
    const cartItems = await sql`
      SELECT ci.* FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id = ${cartItemId} AND c.user_id = ${userId}
    `

    if (cartItems.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cart item not found or access denied' 
        },
        { status: 404 }
      )
    }

    await sql`
      DELETE FROM cart_items WHERE id = ${cartItemId}
    `

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart'
    })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to remove from cart' 
      },
      { status: 500 }
    )
  }
}
