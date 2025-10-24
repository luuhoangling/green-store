'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface ProductCardProps {
  product: {
    id: number | string
    name?: string
    title?: string
    slug?: string
    price: number
    salePrice?: number | null
    price_sale?: number | null
    isSale?: boolean
    is_sale?: boolean
    stock?: number | null
    imageUrl?: string | null
    image_url?: string | null
    badge?: string
    rating?: number
  }
  showDetailButton?: boolean
}

export default function ProductCard({ product, showDetailButton = false }: ProductCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  // Normalize product properties
  const name = product.name || product.title || 'Sản phẩm'
  const imageUrl = product.imageUrl || product.image_url
  const salePrice = product.salePrice || product.price_sale
  const isSale = product.isSale || product.is_sale

  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (product.slug) {
      router.push(`/products/${product.slug}`)
    } else {
      router.push(`/products/${product.id}`)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement add to cart
    console.log('Add to cart:', product.id)
  }

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement add to wishlist
    console.log('Add to wishlist:', product.id)
  }

  const calculateDiscount = () => {
    if (isSale && salePrice) {
      return Math.round(((product.price - salePrice) / product.price) * 100)
    }
    return 0
  }

  const discount = calculateDiscount()

  return (
    <motion.div
      className="group relative bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Badge */}
      {(product.badge || (isSale && discount > 0)) && (
        <div className="absolute top-3 left-3 z-10">
          {product.badge && (
            <span className="inline-block bg-gradient-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              {product.badge}
            </span>
          )}
          {isSale && discount > 0 && !product.badge && (
            <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              -{discount}%
            </span>
          )}
        </div>
      )}

      {/* Image Container */}
      <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Hover Overlay with Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2"
        >
          {/* Quick View Button */}
          <button
            onClick={handleViewDetail}
            className="group/btn bg-white hover:bg-[#6a9739] text-gray-800 hover:text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
            aria-label="Xem nhanh"
            title="Xem nhanh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="group/btn bg-white hover:bg-[#6a9739] text-gray-800 hover:text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
            aria-label="Thêm vào giỏ"
            title="Thêm vào giỏ"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>

          {/* Add to Wishlist Button */}
          <button
            onClick={handleAddToWishlist}
            className="group/btn bg-white hover:bg-[#6a9739] text-gray-800 hover:text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
            aria-label="Yêu thích"
            title="Yêu thích"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name - Max 2 lines */}
        <h3 
          className="text-base font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3rem] hover:text-[#6a9739] transition-colors cursor-pointer"
          onClick={handleViewDetail}
        >
          {name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < product.rating! ? 'text-[#ffc107]' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          {isSale && salePrice ? (
            <>
              <span className="text-lg font-bold text-[#6a9739]">
                {formatVnd(salePrice)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatVnd(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-[#6a9739]">
              {formatVnd(product.price)}
            </span>
          )}
        </div>

        {/* Stock Info */}
        {product.stock != null && (
          <div className="mt-2">
            {product.stock > 0 ? (
              <span className="text-xs text-green-600 font-medium">
                Còn hàng: {product.stock}
              </span>
            ) : (
              <span className="text-xs text-red-600 font-medium">
                Hết hàng
              </span>
            )}
          </div>
        )}
      </div>

      {/* Optional Detail Button */}
      {showDetailButton && (
        <div className="px-4 pb-4">
          <button
            onClick={handleViewDetail}
            className="w-full py-2.5 px-4 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Xem chi tiết
          </button>
        </div>
      )}
    </motion.div>
  )
}

function formatVnd(value?: number | null) {
  if (!value && value !== 0) return ''
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(value)
}
