'use client'

import { useState, useEffect } from 'react'
import { formatPrice, calculateDiscountPercentage } from '@/lib/price-utils'
import toast from 'react-hot-toast'
import { adminGet, adminPost, adminPut } from '@/lib/admin-api'

interface Promotion {
  id: number
  name: string
  description: string
  price: number
  salePrice: number
  isSale: boolean
  category: string
  imageUrl: string
  stock: number
  isActive: boolean
  createdAt: string
}

export default function AdminPromotionsPage() {
  const [allProducts, setAllProducts] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [editingProduct, setEditingProduct] = useState<number | null>(null)
  const [editSalePrice, setEditSalePrice] = useState<string>('')

  useEffect(() => {
    fetchAllProducts()
  }, [])


  const fetchAllProducts = async () => {
    setLoading(true)
    try {
      const response = await adminGet('/api/admin/all-products')
      const result = await response.json()
      
      if (result.success) {
        const transformedProducts = result.data.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          salePrice: product.sale_price || 0,
          isSale: product.is_sale || false,
          category: product.category_name || product.category_id,
          imageUrl: product.image_url,
          stock: product.stock,
          isActive: product.is_active || false,
          createdAt: product.created_at
        }))
        
        setAllProducts(transformedProducts)
      } else {
        console.error('Error fetching all products:', result.error)
        setAllProducts([])
      }
    } catch (error) {
      console.error('Error fetching all products:', error)
      setAllProducts([])
    } finally {
      setLoading(false)
    }
  }


  const updatePromotionStatus = async (promotionId: number, isSale: boolean) => {
    try {
      const response = await adminPut('/api/admin/promotions', {
        productId: promotionId,
        isSale: isSale
      })

      const result = await response.json()
      
      if (result.success) {
        fetchAllProducts() // Refresh all products
        toast.success('Cập nhật trạng thái khuyến mại thành công!')
      } else {
        toast.error('Có lỗi xảy ra: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating promotion status:', error)
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái khuyến mại')
    }
  }

  const updateSalePrice = async (productId: number, salePrice: string) => {
    try {
      // Convert string to number, handle empty string as 0
      const numericSalePrice = salePrice.trim() === '' ? 0 : parseInt(salePrice, 10)
      
      // Validate the input
      if (isNaN(numericSalePrice) || numericSalePrice < 0) {
        toast.error('Vui lòng nhập giá khuyến mại hợp lệ (số nguyên >= 0)')
        return
      }

      const response = await adminPost('/api/admin/promotions', {
        productId: productId,
        salePrice: numericSalePrice
      })

      const result = await response.json()
      
      if (result.success) {
        setEditingProduct(null)
        setEditSalePrice('')
        fetchAllProducts() // Refresh all products
        toast.success('Cập nhật giá khuyến mại thành công!')
      } else {
        toast.error('Có lỗi xảy ra: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating sale price:', error)
      toast.error('Có lỗi xảy ra khi cập nhật giá khuyến mại')
    }
  }

  const startEditing = (product: Promotion) => {
    setEditingProduct(product.id)
    setEditSalePrice(product.salePrice > 0 ? product.salePrice.toString() : '')
  }

  const cancelEditing = () => {
    setEditingProduct(null)
    setEditSalePrice('')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }


  // Search and pagination logic
  const getFilteredProducts = () => {
    if (!searchTerm.trim()) {
      return allProducts
    }
    
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getPaginatedProducts = () => {
    const filteredProducts = getFilteredProducts()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }

  const filteredProducts = getFilteredProducts()
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }


  return (
    <div>
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Quản lý khuyến mại</h1>
          <p className="text-gray-600">Quản lý khuyến mại cho tất cả sản phẩm</p>
        </div>
      </div>


      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Tìm kiếm sản phẩm:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Nhập tên sản phẩm hoặc danh mục..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange('')}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Tìm thấy {filteredProducts.length} sản phẩm
          </div>
        )}
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách tất cả sản phẩm</h2>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá gốc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá khuyến mại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tỷ lệ giảm
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getPaginatedProducts().map((promotion) => (
                  <tr key={promotion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover" src={promotion.imageUrl} alt={promotion.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                          <div className="text-sm text-gray-500">{promotion.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(promotion.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                      {editingProduct === promotion.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editSalePrice}
                            onChange={(e) => {
                              const value = e.target.value
                              // Only allow digits and empty string
                              if (value === '' || /^\d+$/.test(value)) {
                                setEditSalePrice(value)
                              }
                            }}
                            onKeyDown={(e) => {
                              // Allow backspace, delete, tab, escape, enter
                              if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                                  // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                  (e.keyCode === 65 && e.ctrlKey === true) ||
                                  (e.keyCode === 67 && e.ctrlKey === true) ||
                                  (e.keyCode === 86 && e.ctrlKey === true) ||
                                  (e.keyCode === 88 && e.ctrlKey === true)) {
                                return
                              }
                              // Ensure that it is a number and stop the keypress
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                e.preventDefault()
                              }
                            }}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Giá KM"
                            autoFocus
                          />
                          <button
                            onClick={() => updateSalePrice(promotion.id, editSalePrice)}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{promotion.salePrice > 0 ? formatPrice(promotion.salePrice) : '--'}</span>
                          <button
                            onClick={() => startEditing(promotion)}
                            className="px-2 py-1 bg-[#e6f0d9] text-[#527a2d] rounded text-xs hover:bg-[#c8e0b3]"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => updatePromotionStatus(promotion.id, !promotion.isSale)}
                            className={`px-2 py-1 rounded text-xs ${
                              promotion.isSale 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {promotion.isSale ? 'Tắt' : 'Bật'}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {promotion.salePrice > 0 ? calculateDiscountPercentage(promotion.price, promotion.salePrice) + '%' : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              {searchTerm ? `Không tìm thấy sản phẩm nào với từ khóa "${searchTerm}"` : 'Không có sản phẩm nào'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredProducts.length > itemsPerPage && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}đến{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                  </span>
                  {' '}trong tổng số{' '}
                  <span className="font-medium">{filteredProducts.length}</span> sản phẩm
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Trước</span>
                    ←
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-[#f4f8f0] border-[#6a9739] text-[#6a9739]'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Sau</span>
                    →
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}