'use client'

import Link from 'next/link'
import { useState } from 'react'

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

export default function NavMenu() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  return (
    <nav className="hidden lg:flex items-center space-x-1">
      {menuItems.map((item) => (
        <div
          key={item.href}
          className="relative group"
          onMouseEnter={() => item.children && setActiveDropdown(item.label)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          {item.children ? (
            <>
              <button
                className="text-gray-700 hover:text-[#6a9739] hover:bg-[#f4f8f0] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739] focus-visible:ring-offset-2"
                aria-expanded={activeDropdown === item.label}
                aria-haspopup="true"
              >
                <span>{item.label}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeDropdown === item.label ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown */}
              {activeDropdown === item.label && (
                <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f4f8f0] hover:text-[#6a9739] transition-colors focus-visible:outline-none focus-visible:bg-[#f4f8f0] focus-visible:text-[#6a9739]"
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
              className="text-gray-700 hover:text-[#6a9739] hover:bg-[#f4f8f0] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739] focus-visible:ring-offset-2"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
