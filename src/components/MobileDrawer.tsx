'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import HeaderSearchBox from './HeaderSearchBox'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  label: string
  href: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    label: 'Trang chủ',
    href: '/',
  },
  {
    label: 'Theo mùa',
    href: '/products?filter=seasonal',
  },
  {
    label: 'Danh mục',
    href: '/categories',
    children: [
      { label: 'Rau - Củ - Quả', href: '/categories/rau-cu-qua' },
      { label: 'Thịt - Phụ phẩm', href: '/categories/thit-phu-pham' },
      { label: 'Thủy sản', href: '/categories/thuy-san' },
      { label: 'Gạo - Ngũ cốc', href: '/categories/gao-ngu-coc' },
      { label: 'Trứng', href: '/categories/trung' },
      { label: 'Nấm', href: '/categories/nam' },
    ],
  },
  {
    label: 'Khuyến mãi',
    href: '/products?filter=promotion',
  },
  {
    label: 'Tin tức',
    href: '/blog',
  },
  {
    label: 'Liên hệ',
    href: '/contact',
  },
]

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const handleLogout = async () => {
    await logout()
    router.push('/')
    onClose()
  }

  const toggleSubmenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 lg:hidden shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gradient-primary">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739]"
              aria-label="Đóng menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Box */}
          <div className="mb-6">
            <HeaderSearchBox />
          </div>

          {/* User Info */}
          {user ? (
            <div className="mb-6 p-4 bg-[#f4f8f0] rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-[#6a9739] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-600 truncate">{user.email}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 space-y-2">
              <Link
                href="/login"
                className="block w-full text-center bg-white border-2 border-[#6a9739] text-[#6a9739] px-4 py-3 rounded-lg font-medium hover:bg-[#f4f8f0] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739]"
                onClick={onClose}
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="block w-full text-center bg-gradient-primary text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739] focus-visible:ring-offset-2"
                onClick={onClose}
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.href}>
                {item.children ? (
                  <>
                    {/* Menu with submenu - Accordion */}
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-[#f4f8f0] hover:text-[#6a9739] rounded-lg transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739]"
                    >
                      <span>{item.label}</span>
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${
                          expandedMenu === item.label ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Submenu */}
                    {expandedMenu === item.label && (
                      <div className="mt-1 ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-[#f4f8f0] hover:text-[#6a9739] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739]"
                            onClick={onClose}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-gray-700 hover:bg-[#f4f8f0] hover:text-[#6a9739] rounded-lg transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739]"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {/* User Menu Links (if logged in) */}
            {user && (
              <>
                <div className="my-4 border-t border-gray-200"></div>

                {user.role === 'admin' && (
                  <Link
                    href="/admin/orders"
                    className="block px-4 py-3 text-gray-700 hover:bg-[#f4f8f0] hover:text-[#6a9739] rounded-lg transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739]"
                    onClick={onClose}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Quản trị</span>
                    </div>
                  </Link>
                )}

                <Link
                  href="/me"
                  className="block px-4 py-3 text-gray-700 hover:bg-[#f4f8f0] hover:text-[#6a9739] rounded-lg transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739]"
                  onClick={onClose}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                <Link
                  href="/orders"
                  className="block px-4 py-3 text-gray-700 hover:bg-[#f4f8f0] hover:text-[#6a9739] rounded-lg transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739]"
                  onClick={onClose}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  )
}
