'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSearch } from '@/lib/search-context'
import ProductCard from '@/components/ProductCard'

interface Product {
  id: number
  name: string
  slug: string
  brand: string | null
  description: string | null
  price: number
  salePrice: number | null
  isSale: boolean
  stock: number
  imageUrl: string | null
  category: {
    id: number
    name: string
  } | null
}

interface Category {
  id: number
  name: string
  slug: string
  children: Category[]
  _count: {
    products: number
  }
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { searchQuery, setSearchQuery, performSearch } = useSearch()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('price_asc')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [onSale, setOnSale] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if sale parameter is in URL
    const saleParam = searchParams.get('sale')
    if (saleParam === 'true') {
      setOnSale(true)
    }
    
    // Sync search query from URL
    const qParam = searchParams.get('q')
    if (qParam && qParam !== searchQuery) {
      setSearchQuery(qParam)
    }
  }, [searchParams, searchQuery, setSearchQuery])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, selectedCategory, sortBy, minPrice, maxPrice, currentPage, onSale])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '15',
        sortBy: sortBy
      })
      
      if (selectedCategory) {
        params.append('category', selectedCategory)
      }
      
      if (searchQuery) {
        params.append('q', searchQuery)
      }
      
      if (minPrice) {
        params.append('minPrice', minPrice)
      }
      
      if (maxPrice) {
        params.append('maxPrice', maxPrice)
      }

      if (onSale) {
        params.append('sale', 'true')
      }

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    performSearch(searchQuery)
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Auto search after 500ms delay (debounce)
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    const timeout = setTimeout(() => {
      setCurrentPage(1)
      fetchProducts()
    }, 500)
    
    setSearchTimeout(timeout)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
    setCurrentPage(1)
  }

  const handlePriceFilterChange = () => {
    setCurrentPage(1)
    fetchProducts()
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSortBy('price_asc')
    setMinPrice('')
    setMaxPrice('')
    setOnSale(false)
    setCurrentPage(1)
    performSearch('')
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gradient-blue mb-6 animate-fade-in">
        {onSale ? 'Sản phẩm khuyến mãi' : 'Sản phẩm'}
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filter - Left */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-md border sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h2>
            
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6a9739] focus:border-[#6a9739]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6a9739] focus:border-[#6a9739]"
                >
                  <option value="">Tất cả</option>
                  {categories.map((category) => (
                    <optgroup key={category.id} label={category.name}>
                      <option value={category.id}>
                        {category.name} ({category._count.products})
                      </option>
                      {category.children.map((child) => (
                        <option key={child.id} value={child.id}>
                          └ {child.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sắp xếp
                </label>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6a9739] focus:border-[#6a9739]"
                >
                  <option value="price_asc">Giá: Thấp → Cao</option>
                  <option value="price_desc">Giá: Cao → Thấp</option>
                  <option value="name_asc">Tên: A → Z</option>
                  <option value="name_desc">Tên: Z → A</option>
                </select>
              </div>
              
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoảng giá
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    onBlur={handlePriceFilterChange}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6a9739] focus:border-[#6a9739]"
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    onBlur={handlePriceFilterChange}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6a9739] focus:border-[#6a9739]"
                  />
                </div>
              </div>

              {/* Sale Checkbox */}
              <div className="pt-2 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onSale}
                    onChange={(e) => {
                      setOnSale(e.target.checked)
                      setCurrentPage(1)
                    }}
                    className="w-4 h-4 text-[#6a9739] border-gray-300 rounded focus:ring-[#6a9739]"
                  />
                  <span className="text-sm text-gray-700">Khuyến mãi</span>
                </label>
              </div>

              {/* Clear Button */}
              <button
                type="button"
                onClick={clearFilters}
                className="w-full px-3 py-2 text-sm border border-[#6a9739] text-[#6a9739] rounded-lg hover:bg-[#f4f8f0] transition-colors"
              >
                Xóa bộ lọc
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content - Right */}
        <main className="flex-1 min-w-0">
        {!loading && searchQuery && (
          <div className="mb-6 p-4 bg-gradient-blue-light border border-blue-200 rounded-xl animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-blue-800 font-medium">
                  Kết quả tìm kiếm cho: <span className="font-semibold">"{searchQuery}"</span>
                </span>
              </div>
              <div className="text-sm text-blue-600">
                {products.length} sản phẩm
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                <div className="w-full aspect-[4/5] bg-gray-200"></div>
                <div className="p-3">
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <div key={product.id} className="transform scale-90 origin-top">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  
                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        1
                      </button>
                      {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                    </>
                  )}
                  
                  {/* Pages around current page */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    if (pageNum < 1 || pageNum > totalPages) return null
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 border rounded-lg transition-all duration-300 ${
                          currentPage === pageNum
                            ? 'bg-[#6a9739] text-white border-[#6a9739] shadow-lg'
                            : 'border-gray-300 hover:bg-[#f4f8f0] hover:border-[#6a9739]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  {/* Last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? `Không tìm thấy sản phẩm cho "${searchQuery}"` : 'Không tìm thấy sản phẩm'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả.' 
                : 'Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.'
              }
            </p>
            {searchQuery && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Gợi ý tìm kiếm:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['điện', 'nước', 'công tắc', 'ổ cắm', 'bơm', 'quạt', 'đèn'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setSearchQuery(suggestion)
                        performSearch(suggestion)
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </main>
      </div>
    </div>
  )
}
