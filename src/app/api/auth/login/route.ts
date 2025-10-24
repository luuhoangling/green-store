import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and password are required' 
        },
        { status: 400 }
      )
    }

    // Find user
    const users = await sql`
      SELECT id, email, password_hash, name, role 
      FROM users 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid credentials' 
        },
        { status: 401 }
      )
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid credentials' 
        },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    })

    // Set token as httpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    return response
  } catch (error) {
    console.error('Error logging in user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to login' 
      },
      { status: 500 }
    )
  }
}
