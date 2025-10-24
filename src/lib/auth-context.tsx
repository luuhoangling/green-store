'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  loading: boolean
  refreshAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth data in localStorage and validate with server
    const validateAndSetAuth = async () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          
          // Validate token with server
          const response = await fetch('/api/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              // Token is valid, set auth state
              setToken(storedToken)
              setUser(userData)
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem('token')
              localStorage.removeItem('user')
            }
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        } catch (error) {
          console.error('Error validating token:', error)
          // Clear invalid data
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    validateAndSetAuth()
  }, [])

  const login = (userData: User, userToken: string) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('token', userToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const refreshAuth = async (): Promise<boolean> => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!storedToken || !storedUser) {
      return false
    }

    try {
      const userData = JSON.parse(storedUser)
      
      // Validate token with server
      const response = await fetch('/api/me', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Token is valid, update auth state
          setToken(storedToken)
          setUser(userData)
          return true
        }
      }
      
      // Token is invalid, clear storage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setToken(null)
      return false
    } catch (error) {
      console.error('Error refreshing auth:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setToken(null)
      return false
    }
  }

  const logout = async () => {
    try {
      // Call logout API to clear server-side cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
    } catch (error) {
      console.error('Error calling logout API:', error)
    } finally {
      // Clear client-side state regardless of API call result
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
