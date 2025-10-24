'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/price-utils'
import ScrollToTop from '@/components/ScrollToTop'

interface Category {
  id: number
  name: string
  slug: string
  children: Category[]
  _count: {
    products: number
  }
}

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
  category: {
    id: number
    name: string
    slug: string
  } | null
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [categoryProducts, setCategoryProducts] = useState<{[key: number]: Product[]}>({})
  const [productsLoading, setProductsLoading] = useState(false)
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0)

  useEffect(() => {
    fetchCategories()
  }, [])

  // Auto-slide effect for hero slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % 4)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Auto-slide effect - move one category at a time
  useEffect(() => {
    if (categories.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % categories.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [categories.length])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
        // Fetch products for each category
        fetchProductsForCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProductsForCategories = async (categories: Category[]) => {
    setProductsLoading(true)
    try {
      const productPromises = categories.map(async (category) => {
        const response = await fetch(`/api/products/by-category?categoryId=${category.id}&limit=5`)
        const data = await response.json()
        return { categoryId: category.id, products: data.success ? data.data : [] }
      })

      const results = await Promise.all(productPromises)
      const productsMap: {[key: number]: Product[]} = {}
      
      results.forEach(({ categoryId, products }) => {
        productsMap[categoryId] = products
      })

      setCategoryProducts(productsMap)
    } catch (error) {
      console.error('Error fetching products for categories:', error)
    } finally {
      setProductsLoading(false)
    }
  }

  // Icon mapping for categories
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    if (name.includes('hoa quả') || name.includes('trái cây') || name.includes('nho') || name.includes('táo')) {
      return (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    }
    if (name.includes('rau') || name.includes('củ') || name.includes('sạch')) {
      return (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
    if (name.includes('gạo') || name.includes('bột') || name.includes('ngũ cốc')) {
      return (
        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    }
    if (name.includes('đặc sản') || name.includes('hà giang') || name.includes('tây bắc')) {
      return (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
    if (name.includes('nấm') || name.includes('cá') || name.includes('hải sản')) {
      return (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
    if (name.includes('quà') || name.includes('tết') || name.includes('biếu')) {
      return (
        <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    }
    // Default icon
    return (
      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  }

  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600', 
      'bg-yellow-100 text-yellow-600',
      'bg-red-100 text-red-600',
      'bg-purple-100 text-purple-600',
      'bg-orange-100 text-orange-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
      'bg-teal-100 text-teal-600',
      'bg-gray-100 text-gray-600'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Slider Section */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden mb-8 animate-fade-in">
        <div className="relative">
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentHeroSlide * 100}%)` }}
          >
            <div className="w-full flex-shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Nông sản sạch"
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="w-full flex-shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Rau củ tươi"
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="w-full flex-shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Hoa quả tươi"
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="w-full flex-shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Đặc sản vùng miền"
                className="w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-center space-x-4 p-6 bg-gradient-green-light">
          <button
            onClick={() => setCurrentHeroSlide(0)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
              currentHeroSlide === 0 
                ? 'bg-gradient-green text-white shadow-lg' 
                : 'bg-white text-gray-700 border border-green-200 hover:bg-green-50 hover:border-green-300'
            }`}
          >
            <div className="text-center">
              <div className="font-bold">Nông sản sạch</div>
              <div className="text-sm opacity-90">An toàn chất lượng</div>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentHeroSlide(1)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
              currentHeroSlide === 1 
                ? 'bg-gradient-green text-white shadow-lg' 
                : 'bg-white text-gray-700 border border-green-200 hover:bg-green-50 hover:border-green-300'
            }`}
          >
            <div className="text-center">
              <div className="font-bold">Rau củ tươi</div>
              <div className="text-sm opacity-90">Hàng ngày mới</div>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentHeroSlide(2)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
              currentHeroSlide === 2 
                ? 'bg-gradient-green text-white shadow-lg' 
                : 'bg-white text-gray-700 border border-green-200 hover:bg-green-50 hover:border-green-300'
            }`}
          >
            <div className="text-center">
              <div className="font-bold">Hoa quả tươi</div>
              <div className="text-sm opacity-90">Ngọt ngon tự nhiên</div>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentHeroSlide(3)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
              currentHeroSlide === 3 
                ? 'bg-gradient-green text-white shadow-lg' 
                : 'bg-white text-gray-700 border border-green-200 hover:bg-green-50 hover:border-green-300'
            }`}
          >
            <div className="text-center">
              <div className="font-bold">Đặc sản vùng miền</div>
              <div className="text-sm opacity-90">Hương vị đậm đà</div>
            </div>
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden card-hover animate-slide-in-left">
          <img 
            src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Nông sản sạch"
            className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg border overflow-hidden card-hover animate-fade-in">
          <img 
            src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Hoa quả tươi"
            className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg border overflow-hidden card-hover animate-slide-in-right">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Đặc sản vùng miền"
            className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      {/* Categories Slider */}
      <div className="bg-white rounded-xl shadow-lg border p-6 animate-scale-in">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gradient-green mb-4">Danh mục nông sản</h2>
          <p className="text-gray-600 text-lg">Khám phá đa dạng nông sản sạch, an toàn, chất lượng cao</p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 25}%)` }}
            >
              {categories.map((category, index) => (
                <div key={category.id} className="w-1/4 flex-shrink-0 px-2">
                  <Link 
                    href={`/categories/${category.slug}`} 
                    className="p-4 border rounded-xl hover:bg-blue-50 transition-all duration-300 group block card-hover"
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 ${getCategoryColor(index).split(' ')[0]} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        {getCategoryIcon(category.name)}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {category._count.products} sản phẩm
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            
            {/* Slide indicators */}
            {categories.length > 4 && (
              <div className="flex justify-center mt-6 space-x-2">
                {categories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentSlide === index ? 'bg-blue-600 w-6' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {!loading && categories.length > 0 && (
          <div className="text-center mt-6">
            <Link 
              href="/products" 
              className="inline-flex items-center px-8 py-4 bg-gradient-green text-white rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 btn-primary"
            >
              Xem tất cả nông sản
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Products by Category Section */}
      {!loading && categories.length > 0 && (
        <div className="mt-8">
          {categories.map((category, categoryIndex) => {
            const products = categoryProducts[category.id] || []
            if (products.length === 0) return null

            return (
              <div key={category.id} className="bg-white rounded-xl shadow-lg border p-6 mb-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${getCategoryColor(categoryIndex).split(' ')[0]} rounded-full flex items-center justify-center`}>
                      {getCategoryIcon(category.name)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category._count.products} sản phẩm</p>
                    </div>
                  </div>
                  <Link 
                    href={`/categories/${category.slug}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Xem tất cả →
                  </Link>
                </div>

                {productsLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="bg-white rounded-lg shadow-sm border animate-pulse">
                        <div className="p-4">
                          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="bg-white rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 card-hover"
                      >
                        <div className="p-4">
                          <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                            {product.name}
                          </h3>
                          {product.brand && (
                            <p className="text-xs text-gray-600 mb-2">{product.brand}</p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            {product.isSale && product.salePrice ? (
                              <>
                                <p className="text-sm font-bold text-red-600 truncate">
                                  {formatPrice(product.salePrice)}
                                </p>
                                <p className="text-xs text-gray-500 line-through truncate">
                                  {formatPrice(product.price)}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm font-bold text-blue-600 truncate">
                                {formatPrice(product.price)}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* About Us Section */}
      <div className="bg-white rounded-xl shadow-lg border p-8 mt-8 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient-green mb-4">Về chúng tôi</h2>
          <div className="w-24 h-1 bg-gradient-green mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed">
          <div className="text-center mb-8">
            <p className="text-base">
              Trong thời đại hiện đại, nhu cầu về thực phẩm sạch, an toàn và chất lượng cao ngày càng được người tiêu dùng quan tâm. Sự phát triển của ngành nông nghiệp đòi hỏi các sản phẩm nông sản ngày càng đa dạng, chất lượng luôn được đảm bảo, mang đến những giá trị dinh dưỡng tốt nhất cho sức khỏe. Cùng với đó, các sản phẩm nông sản sạch cũng ngày càng được người dân ưa chuộng, những sản phẩm này đóng vai trò quan trọng trong việc cung cấp dinh dưỡng, đảm bảo sức khỏe cho gia đình.
            </p>
          </div>

          <div>
            <p className="text-base">
              Công ty Cổ phần Tập đoàn Green Store là đơn vị danh tiếng trong lĩnh vực sản xuất và cung ứng nông sản sạch, an toàn, chất lượng cao. Các sản phẩm mang thương hiệu Green Store được sản xuất theo quy trình nghiêm ngặt, đảm bảo an toàn thực phẩm, có thể đáp ứng được tất cả các nhu cầu dinh dưỡng của gia đình Việt Nam.
            </p>
          </div>
        </div>
      </div>

      {/* Main Products Section */}
      <div className="bg-white rounded-xl shadow-lg border p-8 mt-8 animate-slide-in-left">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient-green mb-4">Nông sản chủ lực</h2>
          <div className="w-24 h-1 bg-gradient-green mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-gray-700 leading-relaxed">
          <p className="text-base">
            Nông sản chủ lực của Tập đoàn gồm: Rau củ sạch, hoa quả tươi, gạo thơm, đặc sản vùng miền, nấm các loại, cá biển và các sản phẩm nông sản nhập khẩu chất lượng cao… Những sản phẩm này không chỉ có chất lượng vượt trội, giá trị dinh dưỡng cao, hương vị thơm ngon, mà còn được sản xuất theo quy trình an toàn thực phẩm, mang đến sự tin tưởng, yên tâm cho người tiêu dùng.
          </p>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-xl shadow-lg border p-8 mt-8 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient-green mb-4">Thành tựu và giải thưởng</h2>
          <div className="w-24 h-1 bg-gradient-green mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-gray-700 leading-relaxed">
          <p className="text-base">
            Bên cạnh đó, Tập đoàn Green Store đã khẳng định được uy tín trên thị trường nông sản sạch, và là một trong số ít doanh nghiệp được vinh danh "Thương hiệu quốc gia" trong nhiều năm. Cùng với đó là loạt giải thưởng uy tín như: Hàng Việt Nam chất lượng cao, cúp vàng thương hiệu nổi tiếng ASEAN, thương hiệu mạnh, cúp vàng thương hiệu ngành nông nghiệp, huy chương vàng triển lãm quốc tế nông sản, Top 500 doanh nghiệp phát triển bền vững…
          </p>
        </div>
      </div>

      {/* Vision & Mission Section */}
      <div className="bg-white rounded-xl shadow-lg border p-8 mt-8 animate-slide-in-right">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient-green mb-4">Tầm nhìn và sứ mệnh</h2>
          <div className="w-24 h-1 bg-gradient-green mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-gray-700 leading-relaxed">
          <div className="text-center">
            <p className="text-base">
              Với mong muốn mang lại những sản phẩm nông sản sạch, an toàn, chất lượng cao, Công ty cổ phần Tập đoàn Green Store luôn nỗ lực hết mình để khẳng định uy tín trên thị trường nông sản sạch, phấn đấu trở thành một trong những nhà sản xuất và cung ứng nông sản sạch hàng đầu ở Việt Nam và vươn tầm ra thị trường quốc tế.
            </p>
          </div>
        </div>
      </div>
      
      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  )
}