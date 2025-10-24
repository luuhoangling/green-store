import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface TokenPayload {
  userId: string
  email: string
  role: string
}

export function getUserIdFromToken(request: NextRequest): string | null {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization')
    let token: string | null = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // Fallback to cookie
      token = request.cookies.get('token')?.value || null
    }
    
    if (!token) {
      return null
    }

    const secret = process.env.JWT_SECRET || 'fallback-secret'
    const decoded = jwt.verify(token, secret) as TokenPayload
    return decoded.userId
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

export function getUserIdFromCookie(request: NextRequest): string | null {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return null
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload
    return decoded.userId
  } catch (error) {
    console.error('Error verifying token from cookie:', error)
    return null
  }
}

export function getUserFromToken(request: NextRequest): TokenPayload | null {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization')
    let token: string | null = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // Fallback to cookie
      token = request.cookies.get('token')?.value || null
    }
    
    if (!token) {
      return null
    }

    const secret = process.env.JWT_SECRET || 'fallback-secret'
    const decoded = jwt.verify(token, secret) as TokenPayload
    return decoded
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}