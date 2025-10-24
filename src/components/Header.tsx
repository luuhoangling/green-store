'use client'

import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function Header() {
  const { user, logout, loading } = useAuth()
  const { cartItemCount } = useCart()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isTopBannerVisible, setIsTopBannerVisible] = useState(true)

  const handleLogout = async () => {
    await logout()
    router.push('/')
    setShowUserMenu(false)
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsTopBannerVisible(scrollTop < 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) {
    return (
      <header className={`fixed left-0 right-0 z-40 bg-white shadow-sm transition-all duration-300 ${
        isTopBannerVisible ? 'top-12' : 'top-0'
      } ${!isTopBannerVisible ? 'border-b' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="/logo.jpeg"
                  alt="Green Store Logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <h1 className="text-2xl font-bold text-green-600">
                  Green Store
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className={`fixed left-0 right-0 z-40 bg-white shadow-lg transition-all duration-300 ${
      isTopBannerVisible ? 'top-12' : 'top-0'
    } ${!isTopBannerVisible ? 'border-b border-blue-200' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logo.jpeg"
                alt="Green Store Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <h1 className="text-2xl font-bold text-gradient-green">
                Green Store
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-green-50">
              Trang chủ
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-green-50">
              Sản phẩm
            </Link>
            <Link href="/cart" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg text-sm font-medium relative transition-all duration-300 hover:bg-green-50">
              Giỏ hàng
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-green text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse-glow">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-green-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{user.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-1 z-50 border border-green-200 animate-scale-in">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      {user.email}
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Quản trị
                      </Link>
                    )}
                    <Link
                      href="/me"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Thông tin cá nhân
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Đơn hàng của tôi
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-200"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-green-50">
                  Đăng nhập
                </Link>
                <Link href="/register" className="bg-gradient-green text-white px-6 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
