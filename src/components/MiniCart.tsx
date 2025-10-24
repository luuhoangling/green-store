'use client'

import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function MiniCart() {
  const { cartItemCount, cart } = useCart()
  const [showDropdown, setShowDropdown] = useState(false)

  const cartItems = cart?.items || []

  // Calculate total
  const total = cartItems.reduce((sum: number, item) => {
    return sum + item.unitPriceSnapshot * item.qty
  }, 0)

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <Link
        href="/cart"
        className="relative p-2 hover:bg-[#f4f8f0] rounded-lg transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739] focus-visible:ring-offset-2"
        aria-label={`Giỏ hàng - ${cartItemCount} sản phẩm`}
      >
        <svg
          className="w-6 h-6 text-gray-700 group-hover:text-[#6a9739]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#ff6b35] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
        )}
      </Link>

      {/* Dropdown Preview */}
      {showDropdown && cartItemCount > 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Giỏ hàng của bạn ({cartItemCount} sản phẩm)
            </h3>

            {/* Cart Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cartItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={item.product.imageUrl || '/placeholder.png'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {item.qty} x{' '}
                      {item.unitPriceSnapshot.toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-[#6a9739]">
                    {(item.unitPriceSnapshot * item.qty).toLocaleString('vi-VN')}₫
                  </div>
                </div>
              ))}

              {cartItems.length > 3 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  và {cartItems.length - 3} sản phẩm khác...
                </p>
              )}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Tổng cộng:</span>
                <span className="text-lg font-bold text-[#6a9739]">
                  {total.toLocaleString('vi-VN')}₫
                </span>
              </div>

              {/* Buttons */}
              <div className="flex space-x-2">
                <Link
                  href="/cart"
                  className="flex-1 text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                >
                  Xem giỏ hàng
                </Link>
                <Link
                  href="/checkout"
                  className="flex-1 text-center bg-gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739] focus-visible:ring-offset-2"
                >
                  Thanh toán
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State Dropdown */}
      {showDropdown && cartItemCount === 0 && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl z-50 border border-gray-100 p-6 text-center animate-in fade-in slide-in-from-top-2 duration-200">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-sm text-gray-600 mb-4">Giỏ hàng của bạn đang trống</p>
          <Link
            href="/products"
            className="inline-block bg-gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9739] focus-visible:ring-offset-2"
          >
            Mua sắm ngay
          </Link>
        </div>
      )}
    </div>
  )
}
