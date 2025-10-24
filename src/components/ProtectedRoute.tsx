'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, token, refreshAuth, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth context to finish loading
      if (authLoading) {
        return
      }

      // If no user/token, try to refresh auth from localStorage
      if (!user || !token) {
        const refreshed = await refreshAuth()
        if (!refreshed) {
          // Not authenticated, redirect to login
          router.push('/login')
          return
        }
      }

      // User is authenticated
      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [user, token, authLoading, refreshAuth, router])

  // Show loading state while checking authentication
  if (authLoading || isLoading) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xác thực...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!isAuthenticated) {
    return null
  }

  // User is authenticated, render children
  return <>{children}</>
}
