'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/price-utils'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  price: number
  category: string
  imageUrl: string
  stock: number
  isActive: boolean
  status: 'active' | 'inactive' | 'out_of_stock'
  createdAt: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    salePrice: '',
    category: '',
    categoryId: '',
    imageUrl: '',
    stock: '',
    brand: '',
    description: ''
  })
  const [categories, setCategories] = useState<Array<{id: number, name: string, slug: string}>>([])
  const [editProduct, setEditProduct] = useState({
    name: '',
    price: '',
    salePrice: '',
    category: '',
    categoryId: '',
    imageUrl: '',
    stock: '',
    brand: '',
    description: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [statusFilter])

  // Disable body scroll when modal is open
  useEffect(() => {
    if (showAddForm || showEditForm) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showAddForm, showEditForm])

  useEffect(() => {
    // Reset to page 1 when filter or search changes
    setCurrentPage(1)
  }, [statusFilter, searchQuery])

  useEffect(() => {
    // Update pagination when currentPage changes
    if (allProducts.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedProducts = allProducts.slice(startIndex, endIndex)
      setProducts(paginatedProducts)
    }
  }, [currentPage, allProducts, itemsPerPage])

  // Apply search and filter to products
  useEffect(() => {
    if (allProducts.length > 0) {
      let filteredProducts = allProducts

      // Apply search filter
      if (searchQuery.trim()) {
        filteredProducts = allProducts.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.status === statusFilter)
      }

      // Update pagination
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
      
      setProducts(paginatedProducts)
    }
  }, [searchQuery, statusFilter, currentPage, allProducts, itemsPerPage])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/products')
      const result = await response.json()
      
      if (result.success) {
        const transformedProducts = result.data.map((product: any) => {
          // Xác định trạng thái dựa trên stock và isActive
          let status: 'active' | 'inactive' | 'out_of_stock' = 'active'
          if (!product.is_active) {
            status = 'inactive'
          } else if (product.stock <= 0) {
            status = 'out_of_stock'
          }
          
          return {
            id: product.id,
            name: product.name,
            price: product.price || 0,
            category: product.category_name || product.category || 'Chưa phân loại',
            imageUrl: product.image_url || '/placeholder-product.jpg',
            stock: product.stock || 0,
            isActive: product.is_active,
            status: status,
            createdAt: product.created_at
          }
        })

        // Store all products for search and filter
        setAllProducts(transformedProducts)
      } else {
        console.error('Error fetching products:', result.error)
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      
      if (result.success) {
        setCategories(result.data)
      } else {
        console.error('Error fetching categories:', result.error)
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const handleAddProduct = async () => {
    try {
      // Convert string values to numbers
      const productData = {
        ...newProduct,
        price: newProduct.price ? parseInt(newProduct.price, 10) : 0,
        salePrice: newProduct.salePrice ? parseInt(newProduct.salePrice, 10) : 0,
        stock: newProduct.stock ? parseInt(newProduct.stock, 10) : 0
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      })

      const result = await response.json()
      
      if (result.success) {
        setNewProduct({
          name: '',
          price: '',
          salePrice: '',
          category: '',
          categoryId: '',
          imageUrl: '',
          stock: '',
          brand: '',
          description: ''
        })
        setShowAddForm(false)
        fetchProducts() // Refresh the list
        toast.success('Thêm sản phẩm thành công!')
      } else {
        toast.error('Có lỗi xảy ra: ' + result.error)
      }
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error('Có lỗi xảy ra khi thêm sản phẩm')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setEditProduct({
      name: product.name,
      price: product.price.toString(),
      salePrice: '0', // Will need to fetch from API
      category: product.category,
      categoryId: '', // Will need to find category ID
      imageUrl: product.imageUrl,
      stock: product.stock.toString(),
      brand: '', // Will need to fetch from API
      description: '' // Will need to fetch from API
    })
    setShowEditForm(true)
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    try {
      // Convert string values to numbers
      const productData = {
        id: editingProduct.id,
        ...editProduct,
        price: editProduct.price ? parseInt(editProduct.price, 10) : 0,
        salePrice: editProduct.salePrice ? parseInt(editProduct.salePrice, 10) : 0,
        stock: editProduct.stock ? parseInt(editProduct.stock, 10) : 0
      }

      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      })

      const result = await response.json()
      
      if (result.success) {
        setShowEditForm(false)
        setEditingProduct(null)
        fetchProducts() // Refresh the list
        toast.success('Cập nhật sản phẩm thành công!')
      } else {
        toast.error('Có lỗi xảy ra: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Có lỗi xảy ra khi cập nhật sản phẩm')
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return
    }

    try {
      const response = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: productId })
      })

      const result = await response.json()
      
      if (result.success) {
        fetchProducts() // Refresh the list
        toast.success('Xóa sản phẩm thành công!')
      } else {
        toast.error('Có lỗi xảy ra: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Có lỗi xảy ra khi xóa sản phẩm')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Đang bán'
      case 'inactive': return 'Tạm dừng'
      case 'out_of_stock': return 'Hết hàng'
      default: return status
    }
  }


  const getProductStats = () => {
    // Get filtered products based on search
    let filteredProducts = allProducts
    if (searchQuery.trim()) {
      filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    const active = filteredProducts.filter(product => product.status === 'active').length
    const inactive = filteredProducts.filter(product => product.status === 'inactive').length
    const outOfStock = filteredProducts.filter(product => product.status === 'out_of_stock').length
    const total = filteredProducts.length
    
    return { active, inactive, outOfStock, total }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quản lý sản phẩm</h1>
            <p className="text-gray-600">Thêm, sửa, xóa và quản lý sản phẩm trong hệ thống</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#6a9739] text-white px-4 py-2 rounded-lg hover:bg-[#527a2d] transition-colors"
          >
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {(() => {
          const stats = getProductStats()
          return (
            <>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang bán</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tạm dừng</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hết hàng</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.outOfStock}</p>
                </div>
              </div>
            </>
          )
        })()}
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddForm(false)
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Thêm sản phẩm mới</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tên sản phẩm */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên sản phẩm *
                    </label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên sản phẩm..."
                    />
                  </div>

                  {/* Mô tả */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập mô tả sản phẩm..."
                    />
                  </div>

                  {/* Danh mục */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục *
                    </label>
                    <select
                      value={newProduct.categoryId}
                      onChange={(e) => {
                        const selectedCategory = categories.find(cat => cat.id.toString() === e.target.value)
                        setNewProduct({
                          ...newProduct, 
                          categoryId: e.target.value,
                          category: selectedCategory?.name || ''
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn danh mục...</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id.toString()}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Thương hiệu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thương hiệu
                    </label>
                    <input
                      type="text"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập thương hiệu..."
                    />
                  </div>

                  {/* Giá */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá (VNĐ) *
                    </label>
                    <input
                      type="text"
                      value={newProduct.price}
                      onChange={(e) => {
                        const value = e.target.value
                        // Only allow digits and empty string
                        if (value === '' || /^\d+$/.test(value)) {
                          setNewProduct({...newProduct, price: value})
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  {/* Giá giảm */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá khuyến mại (VNĐ)
                    </label>
                    <input
                      type="text"
                      value={newProduct.salePrice}
                      onChange={(e) => {
                        const value = e.target.value
                        // Only allow digits and empty string
                        if (value === '' || /^\d+$/.test(value)) {
                          setNewProduct({...newProduct, salePrice: value})
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    {newProduct.salePrice && newProduct.price && parseInt(newProduct.salePrice) > 0 && parseInt(newProduct.price) > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        Giảm {Math.round(((parseInt(newProduct.price) - parseInt(newProduct.salePrice)) / parseInt(newProduct.price)) * 100)}%
                      </p>
                    )}
                  </div>

                  {/* Tồn kho */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng tồn kho *
                    </label>
                    <input
                      type="text"
                      value={newProduct.stock}
                      onChange={(e) => {
                        const value = e.target.value
                        // Only allow digits and empty string
                        if (value === '' || /^\d+$/.test(value)) {
                          setNewProduct({...newProduct, stock: value})
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  {/* URL hình ảnh */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL hình ảnh
                    </label>
                    <input
                      type="url"
                      value={newProduct.imageUrl}
                      onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    {newProduct.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={newProduct.imageUrl} 
                          alt="Preview" 
                          className="w-20 h-20 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAddProduct}
                    className="px-6 py-2 bg-[#6a9739] text-white rounded-lg hover:bg-[#527a2d] transition-colors"
                  >
                    Thêm sản phẩm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditForm && editingProduct && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditForm(false)
              setEditingProduct(null)
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h2>
                <button
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingProduct(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tên sản phẩm */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên sản phẩm *
                    </label>
                    <input
                      type="text"
                      value={editProduct.name}
                      onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên sản phẩm..."
                    />
                  </div>

                  {/* Mô tả */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      value={editProduct.description}
                      onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập mô tả sản phẩm..."
                    />
                  </div>

                  {/* Danh mục */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục *
                    </label>
                    <select
                      value={editProduct.categoryId}
                      onChange={(e) => {
                        const selectedCategory = categories.find(cat => cat.id.toString() === e.target.value)
                        setEditProduct({
                          ...editProduct, 
                          categoryId: e.target.value,
                          category: selectedCategory?.name || ''
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn danh mục...</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id.toString()}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Thương hiệu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thương hiệu
                    </label>
                    <input
                      type="text"
                      value={editProduct.brand}
                      onChange={(e) => setEditProduct({...editProduct, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập thương hiệu..."
                    />
                  </div>

                  {/* Giá */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá (VNĐ) *
                    </label>
                    <input
                      type="text"
                      value={editProduct.price}
                      onChange={(e) => {
                        const value = e.target.value
                        // Only allow digits and empty string
                        if (value === '' || /^\d+$/.test(value)) {
                          setEditProduct({...editProduct, price: value})
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  {/* Giá giảm */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá khuyến mại (VNĐ)
                    </label>
                    <input
                      type="text"
                      value={editProduct.salePrice}
                      onChange={(e) => {
                        const value = e.target.value
                        // Only allow digits and empty string
                        if (value === '' || /^\d+$/.test(value)) {
                          setEditProduct({...editProduct, salePrice: value})
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    {editProduct.salePrice && editProduct.price && parseInt(editProduct.salePrice) > 0 && parseInt(editProduct.price) > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        Giảm {Math.round(((parseInt(editProduct.price) - parseInt(editProduct.salePrice)) / parseInt(editProduct.price)) * 100)}%
                      </p>
                    )}
                  </div>

                  {/* Tồn kho */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng tồn kho *
                    </label>
                    <input
                      type="text"
                      value={editProduct.stock}
                      onChange={(e) => {
                        const value = e.target.value
                        // Only allow digits and empty string
                        if (value === '' || /^\d+$/.test(value)) {
                          setEditProduct({...editProduct, stock: value})
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  {/* URL hình ảnh */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL hình ảnh
                    </label>
                    <input
                      type="url"
                      value={editProduct.imageUrl}
                      onChange={(e) => setEditProduct({...editProduct, imageUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    {editProduct.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={editProduct.imageUrl} 
                          alt="Preview" 
                          className="w-20 h-20 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={() => {
                      setShowEditForm(false)
                      setEditingProduct(null)
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateProduct}
                    className="px-6 py-2 bg-[#6a9739] text-white rounded-lg hover:bg-[#527a2d] transition-colors"
                  >
                    Cập nhật sản phẩm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm sản phẩm</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên sản phẩm hoặc danh mục..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="sm:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Tạm dừng</option>
              <option value="out_of_stock">Hết hàng</option>
            </select>
          </div>
        </div>
        
        {/* Search Results Info */}
        {searchQuery && (
          <div className="mt-4 p-3 bg-[#f4f8f0] rounded-lg">
            <p className="text-sm text-[#527a2d]">
              <span className="font-medium">Kết quả tìm kiếm:</span> Tìm thấy {getProductStats().total} sản phẩm cho từ khóa "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách sản phẩm</h2>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img className="h-12 w-12 rounded-lg object-cover" src={product.imageUrl} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {getStatusText(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-1 bg-[#e6f0d9] text-[#527a2d] rounded text-xs hover:bg-[#c8e0b3] transition-colors"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
            <p className="text-gray-600">Thêm sản phẩm đầu tiên để bắt đầu bán hàng.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {(() => {
        // Calculate filtered products for pagination
        let filteredProducts = allProducts
        if (searchQuery.trim()) {
          filteredProducts = allProducts.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }
        if (statusFilter !== 'all') {
          filteredProducts = filteredProducts.filter(product => product.status === statusFilter)
        }
        
        return filteredProducts.length > itemsPerPage
      })() && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
          {(() => {
            // Calculate filtered products for pagination
            let filteredProducts = allProducts
            if (searchQuery.trim()) {
              filteredProducts = allProducts.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase())
              )
            }
            if (statusFilter !== 'all') {
              filteredProducts = filteredProducts.filter(product => product.status === statusFilter)
            }
            
            const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
            
            return (
              <>
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
                      <span className="font-medium">{filteredProducts.length}</span>
                      {' '}sản phẩm
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Trước</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                        })
                        .map((page, index, array) => (
                          <div key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === currentPage
                                  ? 'z-10 bg-[#f4f8f0] border-[#6a9739] text-[#6a9739]'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        ))}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Sau</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}
