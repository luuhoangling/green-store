'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AccountMenu() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/')
    setShowUserMenu(false)
  }

  if (loading) {
    return (
      <div className="hidden lg:flex items-center space-x-2">
        <div className="w-24 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="relative hidden lg:block">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center space-x-2 text-gray-700 hover:text-[#6a9739] hover:bg-[#f4f8f0] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739] focus-visible:ring-offset-2"
          aria-expanded={showUserMenu}
          aria-haspopup="true"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="max-w-[100px] truncate">{user.name}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              showUserMenu ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showUserMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-20 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Info Header */}
              <div className="px-4 py-3 text-sm text-gray-500 border-b border-gray-100">
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="truncate">{user.email}</div>
              </div>

              {/* Admin Link */}
              {user.role === 'admin' && (
                <Link
                  href="/admin/orders"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f4f8f0] hover:text-[#6a9739] transition-colors focus-visible:outline-none focus-visible:bg-[#f4f8f0] focus-visible:text-[#6a9739]"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Quản trị</span>
                  </div>
                </Link>
              )}

              {/* Profile Link */}
              <Link
                href="/me"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f4f8f0] hover:text-[#6a9739] transition-colors focus-visible:outline-none focus-visible:bg-[#f4f8f0] focus-visible:text-[#6a9739]"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Thông tin cá nhân</span>
                </div>
              </Link>

              {/* Orders Link */}
              <Link
                href="/orders"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f4f8f0] hover:text-[#6a9739] transition-colors focus-visible:outline-none focus-visible:bg-[#f4f8f0] focus-visible:text-[#6a9739]"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span>Đơn hàng của tôi</span>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:bg-red-50"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Đăng xuất</span>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  // Not logged in
  return (
    <div className="hidden lg:flex items-center space-x-2">
      <Link
        href="/login"
        className="text-gray-700 hover:text-[#6a9739] hover:bg-[#f4f8f0] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739] focus-visible:ring-offset-2"
      >
        Đăng nhập
      </Link>
      <Link
        href="/register"
        className="bg-gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739] focus-visible:ring-offset-2"
      >
        Đăng ký
      </Link>
    </div>
  )
}
