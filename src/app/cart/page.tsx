'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'

interface CartItem {
  id: number
  qty: number
  unitPriceSnapshot: number
  product: {
    id: number
    name: string
    slug: string
    imageUrl: string | null
  }
}

interface Cart {
  id: number
  items: CartItem[]
}

interface Address {
  id: number
  line1: string
  city: string
  district: string
  ward: string
  is_default: boolean
}

interface ShippingAddress {
  line1: string
  city: string
  district: string
  ward: string
}

export default function CartPage() {
  const { cart, updateCartItem, removeFromCart, refreshCart } = useCart()
  const { user, token, refreshAuth, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    line1: '',
    city: '',
    district: '',
    ward: ''
  })
  const [addressFormErrors, setAddressFormErrors] = useState<{[key: string]: string}>({})
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  // Disable body scroll when modal is open
  useEffect(() => {
    if (showCheckoutModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showCheckoutModal])

  useEffect(() => {
    if (cart !== null) {
      setLoading(false)
    }
  }, [cart])

  // Initialize auth and fetch addresses when user is logged in
  useEffect(() => {
    const initializeAuth = async () => {
      // Wait for auth context to finish loading
      if (authLoading) {
        return
      }

      // If no user/token, try to refresh auth from localStorage
      if (!user || !token) {
        const refreshed = await refreshAuth()
        if (!refreshed) {
          // User is not authenticated, but cart page should still work for guest users
          setLoading(false)
          return
        }
      }

      // Now we have valid auth, fetch addresses
      if (user && token) {
        fetchAddresses()
      }
    }

    initializeAuth()
  }, [user, token, authLoading, refreshAuth])

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/me/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setAddresses(data.data)
        // Set default address as selected
        const defaultAddress = data.data.find((addr: Address) => addr.is_default)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
        } else if (data.data.length > 0) {
          setSelectedAddressId(data.data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const updateQuantity = async (itemId: number, newQty: number) => {
    if (newQty <= 0) {
      removeItem(itemId)
      return
    }

    setUpdating(itemId)
    try {
      const success = await updateCartItem(itemId, newQty)
      
      if (success) {
        toast.success('Đã cập nhật giỏ hàng')
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật giỏ hàng')
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      toast.error('Có lỗi xảy ra khi cập nhật giỏ hàng')
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: number) => {
    setUpdating(itemId)
    try {
      const success = await removeFromCart(itemId)
      
      if (success) {
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
      } else {
        toast.error('Có lỗi xảy ra khi xóa sản phẩm')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Có lỗi xảy ra khi xóa sản phẩm')
    } finally {
      setUpdating(null)
    }
  }

  const formatPrice = (price: number) => {
    // Ensure price is a valid number
    const validPrice = Number(price) || 0
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(validPrice)
  }

  const calculateSubtotal = () => {
    if (!cart) return 0
    return cart.items.reduce((sum, item) => {
      const price = Number(item.unitPriceSnapshot) || 0
      const qty = Number(item.qty) || 0
      return sum + (price * qty)
    }, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() // No shipping fee
  }

  const validateAddressForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!shippingAddress.line1.trim()) {
      errors.line1 = 'Vui lòng nhập địa chỉ chi tiết'
    }
    if (!shippingAddress.city.trim()) {
      errors.city = 'Vui lòng nhập thành phố'
    }
    if (!shippingAddress.district.trim()) {
      errors.district = 'Vui lòng nhập quận/huyện'
    }
    if (!shippingAddress.ward.trim()) {
      errors.ward = 'Vui lòng nhập phường/xã'
    }
    
    setAddressFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddressInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (addressFormErrors[field]) {
      setAddressFormErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const saveShippingAddress = async () => {
    if (!validateAddressForm()) {
      return
    }

    try {
      const response = await fetch('/api/me/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...shippingAddress,
          isDefault: true
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSelectedAddressId(data.data.id)
        setShowAddressForm(false)
        toast.success('Đã lưu địa chỉ giao hàng')
        // Refresh addresses list
        fetchAddresses()
      } else {
        toast.error(data.error || 'Có lỗi xảy ra khi lưu địa chỉ')
      }
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Có lỗi xảy ra khi lưu địa chỉ')
    }
  }

  const handleCheckoutClick = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thanh toán')
      router.push('/login')
      return
    }

    // Check if user has any address or needs to enter one
    if (addresses.length === 0 && !showAddressForm) {
      toast.error('Vui lòng nhập địa chỉ giao hàng')
      setShowAddressForm(true)
      return
    }

    if (!selectedAddressId && !showAddressForm) {
      toast.error('Vui lòng chọn địa chỉ giao hàng')
      return
    }

    // Show checkout modal
    setShowCheckoutModal(true)
    
    // If no addresses, show address form in modal
    if (addresses.length === 0) {
      setShowAddressForm(true)
    }
  }

  const handleConfirmCheckout = async () => {
    // If showing address form, save the address first
    if (showAddressForm) {
      if (!validateAddressForm()) {
        return
      }
      await saveShippingAddress()
      // After saving, selectedAddressId will be set, continue with checkout
    }

    setCheckoutLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addressId: selectedAddressId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Đặt hàng thành công!')
        await refreshCart() // Refresh cart to clear it
        setShowCheckoutModal(false)
        router.push('/orders') // Redirect to orders page
      } else {
        toast.error(data.error || 'Có lỗi xảy ra khi đặt hàng')
      }
    } catch (error) {
      console.error('Error during checkout:', error)
      toast.error('Có lỗi xảy ra khi đặt hàng')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
          <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
          <Link
            href="/products"
            className="inline-block bg-[#6a9739] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#527a2d] transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gradient-blue mb-8 animate-fade-in">Giỏ hàng</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border animate-slide-in-left">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Sản phẩm ({cart.items.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {cart.items.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatPrice(Number(item.unitPriceSnapshot) || 0)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.qty - 1)}
                          disabled={updating === item.id}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">
                          {updating === item.id ? '...' : item.qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                          disabled={updating === item.id}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice((Number(item.unitPriceSnapshot) || 0) * (Number(item.qty) || 0))}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border p-6 sticky top-8 animate-slide-in-right">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
            
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                  <span className="text-lg font-bold text-blue-600">{formatPrice(calculateTotal())}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCheckoutClick}
              disabled={checkoutLoading || !user}
              className="w-full bg-[#6a9739] hover:bg-[#527a2d] text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? 'Đang xử lý...' : 'Thanh toán'}
            </button>
            
            <Link
              href="/products"
              className="block w-full text-center border border-[#6a9739] text-[#6a9739] py-3 px-6 rounded-lg font-semibold hover:bg-[#f4f8f0] transition-all duration-300 transform hover:scale-105"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCheckoutModal(false)
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Xác nhận đơn hàng</h2>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sản phẩm đặt mua</h3>
                <div className="space-y-3">
                  {cart?.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Số lượng: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice((Number(item.unitPriceSnapshot) || 0) * (Number(item.qty) || 0))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Địa chỉ giao hàng</h3>
                
                {/* Address Form */}
                {showAddressForm && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Nhập địa chỉ giao hàng</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Địa chỉ chi tiết *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.line1}
                          onChange={(e) => handleAddressInputChange('line1', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            addressFormErrors.line1 ? 'border-red-300' : 'border-gray-300'
                          } focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                          placeholder="Số nhà, tên đường..."
                        />
                        {addressFormErrors.line1 && (
                          <p className="text-xs text-red-600 mt-1">{addressFormErrors.line1}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Phường/Xã *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.ward}
                            onChange={(e) => handleAddressInputChange('ward', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md text-sm ${
                              addressFormErrors.ward ? 'border-red-300' : 'border-gray-300'
                            } focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="Phường/Xã"
                          />
                          {addressFormErrors.ward && (
                            <p className="text-xs text-red-600 mt-1">{addressFormErrors.ward}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quận/Huyện *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.district}
                            onChange={(e) => handleAddressInputChange('district', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md text-sm ${
                              addressFormErrors.district ? 'border-red-300' : 'border-gray-300'
                            } focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="Quận/Huyện"
                          />
                          {addressFormErrors.district && (
                            <p className="text-xs text-red-600 mt-1">{addressFormErrors.district}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Thành phố *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.city}
                            onChange={(e) => handleAddressInputChange('city', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md text-sm ${
                              addressFormErrors.city ? 'border-red-300' : 'border-gray-300'
                            } focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="Thành phố"
                          />
                          {addressFormErrors.city && (
                            <p className="text-xs text-red-600 mt-1">{addressFormErrors.city}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Address */}
                {!showAddressForm && selectedAddressId && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    {addresses.find(addr => addr.id === selectedAddressId) && (
                      <div>
                        <p className="font-medium text-gray-900">
                          {addresses.find(addr => addr.id === selectedAddressId)?.line1}
                        </p>
                        <p className="text-sm text-gray-600">
                          {addresses.find(addr => addr.id === selectedAddressId)?.ward}, {' '}
                          {addresses.find(addr => addr.id === selectedAddressId)?.district}, {' '}
                          {addresses.find(addr => addr.id === selectedAddressId)?.city}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tóm tắt thanh toán</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                      <span className="text-lg font-bold text-blue-600">{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmCheckout}
                  disabled={checkoutLoading}
                  className="flex-1 px-4 py-2 bg-[#6a9739] hover:bg-[#527a2d] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
