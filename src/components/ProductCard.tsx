'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/cart-context'
import toast from 'react-hot-toast'

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
  const { addToCart } = useCart()
  const [isHovered, setIsHovered] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)

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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (addingToCart) return
    
    // Check stock
    if (product.stock != null && product.stock <= 0) {
      toast.error('Sản phẩm đã hết hàng')
      return
    }

    setAddingToCart(true)
    try {
      const productId = typeof product.id === 'string' ? parseInt(product.id) : product.id
      const success = await addToCart(productId, 1)
      
      if (success) {
        toast.success('Đã thêm vào giỏ hàng!')
      } else {
        toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng')
    } finally {
      setAddingToCart(false)
    }
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
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.badge && !isSale && (
            <motion.span 
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="inline-block bg-gradient-to-r from-[#6a9739] to-[#527a2d] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
            >
              {product.badge}
            </motion.span>
          )}
          {isSale && discount > 0 && (
            <motion.div
              initial={{ scale: 0, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="relative"
            >
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg animate-pulse">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                <span className="font-extrabold">-{discount}%</span>
              </span>
              {/* Shine effect */}
              <span className="absolute inset-0 rounded-lg overflow-hidden">
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
              </span>
            </motion.div>
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
            disabled={addingToCart || (product.stock != null && product.stock <= 0)}
            className="group/btn bg-white hover:bg-[#6a9739] text-gray-800 hover:text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Thêm vào giỏ"
            title="Thêm vào giỏ"
          >
            {addingToCart ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
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

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {isSale && salePrice && salePrice > 0 ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-red-600">
                  {formatVnd(salePrice)}
                </span>
                {discount > 0 && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    Tiết kiệm {formatVnd(product.price - salePrice)}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-400 line-through decoration-2">
                {formatVnd(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-[#6a9739]">
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
