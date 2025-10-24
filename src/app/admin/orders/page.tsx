'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/price-utils'
import toast from 'react-hot-toast'

interface Order {
  id: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shippingFee: number
  total: number
  placedAt: string
  paidAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  paymentProofUrl: string | null
  shippingProvider: string | null
  trackingNumber: string | null
  user: {
    id: number
    name: string
    email: string
  }
  items: {
    id: number
    qty: number
    unitPrice: number
    total: number
    product: {
      id: number
      name: string
    }
  }[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
    fetchRevenueStats()
  }, [statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/orders')
      const result = await response.json()
      
      if (result.success) {
        // Transform the data to match the expected format
        const transformedOrders = result.data.map((order: any) => ({
          id: order.id,
          status: order.status,
          subtotal: order.subtotal,
          shippingFee: order.shipping_fee,
          total: order.total,
          placedAt: order.placed_at,
          paidAt: order.paid_at,
          shippedAt: order.shipped_at,
          deliveredAt: order.delivered_at,
          cancelledAt: order.cancelled_at,
          paymentProofUrl: order.payment_proof_url,
          shippingProvider: order.shipping_provider,
          trackingNumber: order.tracking_number,
          user: order.user,
          items: order.items
        }))
        
        // Store all orders for stats
        setAllOrders(transformedOrders)
        
        // Filter by status if needed
        const filteredOrders = statusFilter === 'all' 
          ? transformedOrders 
          : transformedOrders.filter((order: any) => order.status === statusFilter)
        
        setOrders(filteredOrders)
      } else {
        console.error('Error fetching orders:', result.error)
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, action: string, data?: any) => {
    try {
      // Get token from localStorage for authentication
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/orders/${orderId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data || {})
      })

      const result = await response.json()
      
      if (result.success) {
        fetchOrders() // Refresh orders
        toast.success('Cập nhật đơn hàng thành công!')
      } else {
        toast.error('Có lỗi xảy ra: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Có lỗi xảy ra khi cập nhật đơn hàng')
    }
  }


  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa cập nhật'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-[#e6f0d9] text-[#527a2d]'
      case 'shipped': return 'bg-[#c8e0b3] text-[#3e5c22]'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ thanh toán'
      case 'paid': return 'Đã thanh toán'
      case 'shipped': return 'Đã giao hàng'
      case 'delivered': return 'Đã nhận hàng'
      case 'cancelled': return 'Đã hủy'
      default: return status
    }
  }

  const getOrderStats = () => {
    const pending = allOrders.filter(order => order.status === 'pending').length
    const paid = allOrders.filter(order => order.status === 'paid').length
    const shipped = allOrders.filter(order => order.status === 'shipped').length
    const delivered = allOrders.filter(order => order.status === 'delivered').length
    
    return { pending, paid, shipped, delivered }
  }

  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    orderStats: {
      totalOrders: 0,
      deliveredOrders: 0,
      pendingOrders: 0,
      paidOrders: 0,
      shippedOrders: 0,
      cancelledOrders: 0
    }
  })

  const fetchRevenueStats = async () => {
    try {
      const response = await fetch('/api/admin/revenue', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setRevenueStats(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching revenue stats:', error)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Quản lý đơn hàng</h1>
        <p className="text-gray-600">Theo dõi và quản lý tất cả đơn hàng trong hệ thống</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {(() => {
          const stats = getOrderStats()
          return (
            <>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chờ thanh toán</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-[#e6f0d9] rounded-lg">
                    <svg className="w-6 h-6 text-[#6a9739]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đã thanh toán</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.paid}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-[#c8e0b3] rounded-lg">
                    <svg className="w-6 h-6 text-[#527a2d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đã giao hàng</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.shipped}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.delivered}</p>
                  </div>
                </div>
              </div>
            </>
          )
        })()}
      </div>

      {/* Revenue Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Doanh thu tháng này</p>
                <p className="text-2xl font-semibold text-blue-600">{formatPrice(revenueStats.monthlyRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Doanh thu năm này</p>
                <p className="text-2xl font-semibold text-green-600">{formatPrice(revenueStats.yearlyRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-semibold text-purple-600">{formatPrice(revenueStats.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="shipped">Đã giao hàng</option>
            <option value="delivered">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách đơn hàng</h2>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                      <div className="text-sm text-gray-500">{order.items.length} sản phẩm</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                      <div className="text-sm text-gray-500">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.placedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'mark-paid')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Đánh dấu đã thanh toán
                          </button>
                        )}
                        {order.status === 'paid' && (
                          <button
                            onClick={() => {
                              // Tự động tạo thông tin vận chuyển giả
                              const providers = ['Viettel Post', 'Giao Hàng Nhanh', 'J&T Express', 'Shopee Express', 'Lazada Express']
                              const randomProvider = providers[Math.floor(Math.random() * providers.length)]
                              const randomTracking = 'VN' + Math.random().toString(36).substr(2, 9).toUpperCase()
                              
                              updateOrderStatus(order.id, 'mark-shipped', { 
                                shippingProvider: randomProvider, 
                                trackingNumber: randomTracking 
                              })
                            }}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Đánh dấu đã giao
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'confirm-delivery')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Xác nhận đã nhận hàng
                          </button>
                        )}
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancel')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hủy đơn
                          </button>
                        )}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-gray-600">Các đơn hàng sẽ hiển thị ở đây khi khách hàng đặt hàng.</p>
          </div>
        )}
      </div>
    </div>
  )
}
