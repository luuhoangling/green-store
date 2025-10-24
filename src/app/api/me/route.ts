import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No token provided' 
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
      
      const user = await sql`
        SELECT id, email, name, role, created_at FROM users WHERE id = ${decoded.userId}
      `

      if (!user) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'User not found' 
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: user[0]
      })
    } catch (jwtError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid token' 
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No token provided' 
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { name, email, currentPassword, newPassword } = await request.json()
    
    try {
      console.log('Token received:', token.substring(0, 20) + '...')
      console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
      console.log('Token decoded successfully:', { userId: decoded.userId, email: decoded.email })
      
      // Get current user data
      const currentUser = await sql`
        SELECT id, email, name, password_hash FROM users WHERE id = ${decoded.userId}
      `

      if (!currentUser || currentUser.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'User not found' 
          },
          { status: 404 }
        )
      }

      const user = currentUser[0]

      // If changing password, verify current password
      if (newPassword) {
        if (!currentPassword) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Current password is required to change password' 
            },
            { status: 400 }
          )
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)
        if (!isValidPassword) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Current password is incorrect' 
            },
            { status: 400 }
          )
        }
      }

      // Prevent email changes as email is the username/account identifier
      if (email && email !== user.email) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Email không thể thay đổi vì đây là tên tài khoản' 
          },
          { status: 400 }
        )
      }

      // Prepare update data
      const updateData: any = {
        updated_at: new Date()
      }

      if (name) updateData.name = name
      // Email is not allowed to be updated as it's the account identifier
      if (newPassword) {
        updateData.password_hash = await bcrypt.hash(newPassword, 12)
      }

      // Update user - build query dynamically based on what needs to be updated
      let updateQuery = 'UPDATE users SET '
      const updateValues: any[] = []
      let paramIndex = 1
      
      if (updateData.name) {
        updateQuery += `name = $${paramIndex}, `
        updateValues.push(updateData.name)
        paramIndex++
      }
      
      if (updateData.password_hash) {
        updateQuery += `password_hash = $${paramIndex}, `
        updateValues.push(updateData.password_hash)
        paramIndex++
      }
      
      updateQuery += `updated_at = $${paramIndex} WHERE id = $${paramIndex + 1} RETURNING id, email, name, role, created_at, updated_at`
      updateValues.push(updateData.updated_at, decoded.userId)
      
      const updatedUser = await sql.query(updateQuery, updateValues)

      return NextResponse.json({
        success: true,
        data: updatedUser[0],
        message: 'Profile updated successfully'
      })

    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid token' 
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update profile' 
      },
      { status: 500 }
    )
  }
}
