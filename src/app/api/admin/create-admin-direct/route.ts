import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    // Kiểm tra secret key để bảo mật
    const { email, password, name, secretKey } = await request.json()

    // Thay đổi SECRET_KEY này trong .env của bạn
    const ADMIN_CREATION_SECRET = process.env.ADMIN_CREATION_SECRET || 'your-super-secret-key-change-this'
    
    if (secretKey !== ADMIN_CREATION_SECRET) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid secret key' 
        },
        { status: 403 }
      )
    }

    if (!email || !password || !name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email, password, and name are required' 
        },
        { status: 400 }
      )
    }

    // Kiểm tra xem user đã tồn tại chưa
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User with this email already exists' 
        },
        { status: 400 }
      )
    }

    // Hash password với bcrypt (salt rounds = 12)
    const passwordHash = await bcrypt.hash(password, 12)

    // Tạo admin user với role = 'admin'
    const newUsers = await sql`
      INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
      VALUES (${email}, ${passwordHash}, ${name}, 'admin', NOW(), NOW())
      RETURNING id, email, name, role
    `

    const admin = newUsers[0]

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })

  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create admin account' 
      },
      { status: 500 }
    )
  }
}
