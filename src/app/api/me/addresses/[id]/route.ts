import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth-utils'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const addressId = parseInt(params.id)
    const { line1, city, district, ward, isDefault } = await request.json()
    
    // Ensure isDefault is a boolean
    const isDefaultBoolean = Boolean(isDefault)
    
    // Check if address belongs to user
    const existingAddresses = await sql`
      SELECT * FROM user_addresses 
      WHERE id = ${addressId} AND user_id = ${userId}
    `

    if (existingAddresses.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Address not found' 
        },
        { status: 404 }
      )
    }

    // If this is set as default, unset other defaults
    if (isDefaultBoolean) {
      await sql`
        UPDATE user_addresses 
        SET is_default = false 
        WHERE user_id = ${userId} AND id != ${addressId}
      `
    }

    const updatedAddresses = await sql`
      UPDATE user_addresses 
      SET 
        line1 = ${line1},
        city = ${city},
        district = ${district},
        ward = ${ward},
        is_default = ${isDefaultBoolean},
        updated_at = NOW()
      WHERE id = ${addressId} AND user_id = ${userId}
      RETURNING *
    `

    const address = updatedAddresses[0]

    return NextResponse.json({
      success: true,
      data: address
    })
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update address' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const addressId = parseInt(params.id)
    
    // Check if address belongs to user
    const existingAddresses = await sql`
      SELECT * FROM user_addresses 
      WHERE id = ${addressId} AND user_id = ${userId}
    `

    if (existingAddresses.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Address not found' 
        },
        { status: 404 }
      )
    }

    // Delete the address
    await sql`
      DELETE FROM user_addresses 
      WHERE id = ${addressId} AND user_id = ${userId}
    `

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete address' 
      },
      { status: 500 }
    )
  }
}
