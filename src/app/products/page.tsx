'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearch } from '@/lib/search-context'
import { highlightVietnameseSearchTerms } from '@/lib/vietnamese-utils'
import { formatPrice } from '@/lib/price-utils'

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
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { searchQuery, setSearchQuery, performSearch } = useSearch()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('price_asc')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, selectedCategory, sortBy, minPrice, maxPrice, currentPage])

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
    setCurrentPage(1)
    performSearch('')
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient-blue mb-4 animate-fade-in">Sản phẩm</h1>
        

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-xl shadow-lg border mb-6 animate-slide-in-left">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search and Category Row */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div className="md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="">Tất cả danh mục</option>
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
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-blue text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Tìm kiếm
              </button>
            </div>

            {/* Sort and Price Filter Row */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sắp xếp theo
                </label>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="price_asc">Giá: Thấp → Cao</option>
                  <option value="price_desc">Giá: Cao → Thấp</option>
                  <option value="name_asc">Tên: A → Z</option>
                  <option value="name_desc">Tên: Z → A</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá từ
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    onBlur={handlePriceFilterChange}
                    className="w-24 px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đến
                  </label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    onBlur={handlePriceFilterChange}
                    className="w-24 px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
              >
                Xóa bộ lọc
              </button>
            </div>
          </form>
        </div>


        {/* Search Results Info */}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
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
        ) : products.length > 0 ? (
          <>
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
                    <h3 
                      className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm"
                      dangerouslySetInnerHTML={{
                        __html: searchQuery ? highlightVietnameseSearchTerms(product.name, searchQuery) : product.name
                      }}
                    />
                    {product.brand && (
                      <p 
                        className="text-xs text-gray-600 mb-2"
                        dangerouslySetInnerHTML={{
                          __html: searchQuery ? highlightVietnameseSearchTerms(product.brand, searchQuery) : product.brand
                        }}
                      />
                    )}
                      <div className="flex items-center gap-2">
                        {product.isSale && product.salePrice ? (
                          <>
                            <p className="text-sm font-bold text-red-600">
                              {formatPrice(product.salePrice)}
                            </p>
                            <p className="text-xs text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm font-bold text-blue-600">
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </div>
                      {/* Stock indicator */}
                      <div className="mt-2">
                        {product.stock > 0 ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.stock > 50 
                              ? 'bg-green-100 text-green-800' 
                              : product.stock > 10 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            Còn {product.stock}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Hết hàng
                          </span>
                        )}
                      </div>
                  </div>
                </Link>
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
                            ? 'bg-gradient-blue text-white border-blue-600 shadow-lg'
                            : 'border-blue-200 hover:bg-blue-50 hover:border-blue-300'
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
      </div>
    </div>
  )
}
