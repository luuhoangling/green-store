'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from './ProductCard'

interface Product {
  id: number
  name: string
  slug: string
  brand: string | null
  description: string | null
  price: number
  salePrice: number | null
  isSale: boolean
  imageUrl: string | null
  stock: number
  badge?: string
  rating?: number
  category: {
    id: number
    name: string
    slug: string
  } | null
}

interface Category {
  id: number
  name: string
  slug: string
}

const tabs = [
  { id: 'all', label: 'Tất cả', slug: null },
  { id: 'rau-cu-qua', label: 'Rau - Củ - Quả', slug: 'rau-cu-qua' },
  { id: 'thit', label: 'Thịt - Phụ phẩm', slug: 'thit-phu-pham' },
  { id: 'thuy-san', label: 'Thủy sản', slug: 'thuy-san' },
  { id: 'gao', label: 'Gạo - Ngũ cốc', slug: 'gao-ngu-coc' }
]

export default function FeaturedProductsWithTabs() {
  const [activeTab, setActiveTab] = useState('all')
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [activeTab, products])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?limit=20&featured=true')
      const data = await response.json()
      if (data.success) {
        // Add random badges to some products
        const productsWithBadges = data.data.map((product: Product) => ({
          ...product,
          badge: getRandomBadge(product),
          rating: Math.floor(Math.random() * 2) + 4 // Random rating 4-5
        }))
        setProducts(productsWithBadges)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRandomBadge = (product: Product) => {
    if (product.isSale) return null // Will show discount percentage
    
    const badges = ['Mới', 'Hot', null, null] // 50% chance of no badge
    const randomIndex = Math.floor(Math.random() * badges.length)
    return badges[randomIndex]
  }

  const filterProducts = () => {
    if (activeTab === 'all') {
      setFilteredProducts(products)
      return
    }

    const tab = tabs.find(t => t.id === activeTab)
    if (!tab || !tab.slug) {
      setFilteredProducts(products)
      return
    }

    const filtered = products.filter(product => {
      if (!product.category) return false
      
      // Match by category slug
      return product.category.slug === tab.slug
    })

    setFilteredProducts(filtered)
  }

  return (
    <section className="mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gradient-primary mb-3">
          Sản phẩm nổi bật
        </h2>
        <p className="text-gray-600 text-lg">
          Khám phá những sản phẩm nông sản chất lượng cao
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex justify-center gap-2 md:gap-4 min-w-max px-4 md:px-0">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-[#f4f8f0] hover:text-[#6a9739] border border-gray-200'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-primary rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
              <div className="w-full aspect-[4/5] bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.slice(0, 8).map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 text-lg">Chưa có sản phẩm trong danh mục này</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* View All Button */}
      {!loading && filteredProducts.length > 8 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <a
            href="/products"
            className="inline-flex items-center px-8 py-4 bg-gradient-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Xem tất cả sản phẩm
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      )}
    </section>
  )
}
