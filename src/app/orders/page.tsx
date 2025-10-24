'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/price-utils'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Order {
  id: number
  status: string
  subtotal: number
  shipping_fee: number
  total: number
  placed_at: string
  updated_at: string
}

export default function OrdersPage() {
  const { user, token, refreshAuth, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null)

  useEffect(() => {
    const initializeAuth = async () => {
      // Wait for auth loading to complete
      if (authLoading) return
      
      // If no user or token, try to refresh auth
      if (!user || !token) {
        const refreshed = await refreshAuth()
        if (!refreshed) {
          router.push('/login')
          return
        }
      }
      
      // Fetch orders if we have valid auth
      if (user && token) {
        fetchOrders()
      }
    }

    initializeAuth()
  }, [user, token, authLoading, refreshAuth, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }


  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý'
      case 'confirmed': return 'Đã xác nhận'
      case 'shipped': return 'Đang giao'
      case 'delivered': return 'Đã giao'
      case 'cancelled': return 'Đã hủy'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-[#e6f0d9] text-[#527a2d]'
      case 'shipped': return 'bg-[#c8e0b3] text-[#3e5c22]'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return
    }

    setCancellingOrderId(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh orders list
        await fetchOrders()
        toast.success('Đơn hàng đã được hủy thành công!')
      } else {
        toast.error(data.error || 'Có lỗi xảy ra khi hủy đơn hàng')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Có lỗi xảy ra khi hủy đơn hàng')
    } finally {
      setCancellingOrderId(null)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
            <p className="text-gray-600 mt-1">Theo dõi trạng thái đơn hàng của bạn</p>
          </div>

          <div className="p-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h4>
                <p className="text-gray-600 mb-6">Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
                <Link
                  href="/products"
                  className="inline-block bg-[#6a9739] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#527a2d] transition-colors"
                >
                  Mua sắm ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Đơn hàng #{order.id}</h4>
                        <p className="text-sm text-gray-600">
                          Đặt ngày: {new Date(order.placed_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Tạm tính:</span>
                        <p className="font-medium">{formatPrice(order.subtotal)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <p className="font-medium">{formatPrice(order.shipping_fee)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tổng cộng:</span>
                        <p className="font-bold text-lg text-blue-600">{formatPrice(order.total)}</p>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Cập nhật lần cuối: {new Date(order.updated_at).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Xem chi tiết
                          </Link>
                          {order.status === 'pending' && (
                            <button 
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancellingOrderId === order.id}
                              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancellingOrderId === order.id ? 'Đang hủy...' : 'Hủy đơn hàng'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
