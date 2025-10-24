import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { email, password, name, role = 'buyer' } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email, password, and name are required' 
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User already exists' 
        },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const newUsers = await sql`
      INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
      VALUES (${email}, ${passwordHash}, ${name}, ${role}, NOW(), NOW())
      RETURNING id, email, name, role
    `

    const user = newUsers[0]

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
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
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to register user' 
      },
      { status: 500 }
    )
  }
}
