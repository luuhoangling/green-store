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
    
    const addresses = await sql`
      SELECT * FROM user_addresses 
      WHERE user_id = ${userId}
      ORDER BY is_default DESC, created_at DESC
    `

    return NextResponse.json({
      success: true,
      data: addresses
    })
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch addresses' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { line1, city, district, ward, isDefault } = await request.json()
    
    // Ensure isDefault is a boolean
    const isDefaultBoolean = Boolean(isDefault)
    
    // If this is set as default, unset other defaults
    if (isDefaultBoolean) {
      await sql`
        UPDATE user_addresses 
        SET is_default = false 
        WHERE user_id = ${userId}
      `
    }

    const addresses = await sql`
      INSERT INTO user_addresses (user_id, line1, city, district, ward, is_default, created_at, updated_at)
      VALUES (${userId}, ${line1}, ${city}, ${district}, ${ward}, ${isDefaultBoolean}, NOW(), NOW())
      RETURNING *
    `

    const address = addresses[0]

    return NextResponse.json({
      success: true,
      data: address
    })
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create address' 
      },
      { status: 500 }
    )
  }
}
