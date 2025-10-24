'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import AddressForm from '@/components/AddressForm'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  created_at: string
  updated_at: string
}

interface Address {
  id: number
  line1: string
  city: string
  district: string
  ward: string
  is_default?: boolean
  created_at?: string
  updated_at?: string
}


function ProfilePageContent() {
  const { user, token, login } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  // Address management states
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressLoading, setAddressLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    // Now we have valid auth, fetch profile and addresses
    fetchProfile()
    fetchAddresses()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setProfile(data.data)
        setFormData({
          name: data.data.name,
          email: data.data.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(data.error || 'Không thể tải thông tin cá nhân')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Có lỗi xảy ra khi tải thông tin')
    } finally {
      setLoading(false)
    }
  }

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
      } else {
        console.error('Error fetching addresses:', data.error)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    // Validate password confirmation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp')
      setUpdating(false)
      return
    }

    try {
      const updateData: any = {
        name: formData.name
        // Email is not included as it cannot be changed
      }

      // Only include password fields if new password is provided
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      console.log('Sending update request with token:', token ? token.substring(0, 20) + '...' : 'No token')
      console.log('Update data:', updateData)
      
      const response = await fetch('/api/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      
      if (data.success) {
        setProfile(data.data)
        toast.success('Cập nhật thông tin thành công!')
        
        // Update auth context if name changed (email cannot change)
        if (data.data.name !== user?.name) {
          login(data.data, token!)
        }
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        toast.error(data.error || 'Cập nhật thông tin thất bại')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Có lỗi xảy ra khi cập nhật thông tin')
    } finally {
      setUpdating(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Address management functions
  const handleAddressSubmit = async (addressData: Omit<Address, 'id'>) => {
    setAddressLoading(true)
    try {
      if (editingAddress) {
        // Update existing address
        const response = await fetch(`/api/me/addresses/${editingAddress.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(addressData)
        })

        const data = await response.json()
        
        if (data.success) {
          toast.success('Cập nhật địa chỉ thành công!')
          fetchAddresses()
          setShowAddressForm(false)
          setEditingAddress(null)
        } else {
          toast.error(data.error || 'Cập nhật địa chỉ thất bại')
        }
      } else {
        // Create new address
        const response = await fetch('/api/me/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(addressData)
        })

        const data = await response.json()
        
        if (data.success) {
          toast.success('Thêm địa chỉ thành công!')
          fetchAddresses()
          setShowAddressForm(false)
        } else {
          toast.error(data.error || 'Thêm địa chỉ thất bại')
        }
      }
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Có lỗi xảy ra khi lưu địa chỉ')
    } finally {
      setAddressLoading(false)
    }
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setShowAddressForm(true)
  }

  const handleDeleteAddress = async (addressId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return
    }

    try {
      const response = await fetch(`/api/me/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Xóa địa chỉ thành công!')
        fetchAddresses()
      } else {
        toast.error(data.error || 'Xóa địa chỉ thất bại')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Có lỗi xảy ra khi xóa địa chỉ')
    }
  }

  const handleCancelAddressForm = () => {
    setShowAddressForm(false)
    setEditingAddress(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-blue-light py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gradient-blue animate-fade-in">Thông tin cá nhân</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản và địa chỉ của bạn</p>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="bg-white shadow-lg rounded-xl animate-slide-in-left">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h2>
            </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Basic Information */}
            <div className="space-y-4">
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email (Tên tài khoản)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                  disabled
                  readOnly
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email không thể thay đổi vì đây là tên tài khoản của bạn
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p><strong>Vai trò:</strong> {profile?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
                  <p><strong>Ngày tạo:</strong> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  {profile?.updated_at && (
                    <p><strong>Cập nhật lần cuối:</strong> {new Date(profile.updated_at).toLocaleDateString('vi-VN')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Đổi mật khẩu</h3>
              <p className="text-sm text-gray-600">Để đổi mật khẩu, vui lòng nhập mật khẩu hiện tại và mật khẩu mới.</p>
              
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Chỉ cần nhập khi đổi mật khẩu"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Để trống nếu không muốn đổi mật khẩu"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#6a9739] hover:bg-[#527a2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6a9739] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
              </button>
            </div>
          </form>
          </div>

          {/* Address Management */}
          <div className="bg-white shadow-lg rounded-xl animate-slide-in-right">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Địa chỉ giao hàng</h2>
              <button
                onClick={() => setShowAddressForm(true)}
                className="px-4 py-2 bg-gradient-blue text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Thêm địa chỉ
              </button>
            </div>

            <div className="p-6">
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có địa chỉ</h3>
                  <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm địa chỉ giao hàng đầu tiên.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {address.line1}
                            </h4>
                            {address.is_default && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e6f0d9] text-[#527a2d]">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.ward}, {address.district}, {address.city}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Address Form Modal */}
        {showAddressForm && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCancelAddressForm()
              }
            }}
          >
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
                  </h2>
                  <button
                    onClick={handleCancelAddressForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <AddressForm
                  address={editingAddress}
                  onSubmit={handleAddressSubmit}
                  onCancel={handleCancelAddressForm}
                  loading={addressLoading}
                  title=""
                  submitText={editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  )
}
