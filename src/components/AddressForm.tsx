'use client'

import { useState, useEffect } from 'react'

interface Address {
  id?: number
  line1: string
  city: string
  district: string
  ward: string
  is_default?: boolean
}

interface AddressFormProps {
  address?: Address | null
  onSubmit: (address: Omit<Address, 'id'>) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  title?: string
  submitText?: string
}

export default function AddressForm({ 
  address, 
  onSubmit, 
  onCancel, 
  loading = false,
  title = "Thêm địa chỉ mới",
  submitText = "Lưu địa chỉ"
}: AddressFormProps) {
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    line1: '',
    city: '',
    district: '',
    ward: '',
    is_default: false
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    if (address) {
      setFormData({
        line1: address.line1 || '',
        city: address.city || '',
        district: address.district || '',
        ward: address.ward || '',
        is_default: address.is_default || false
      })
    }
  }, [address])

  const handleInputChange = (field: keyof Omit<Address, 'id'>, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.line1.trim()) {
      newErrors.line1 = 'Vui lòng nhập địa chỉ chi tiết'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Vui lòng nhập tỉnh/thành phố'
    }

    if (!formData.district.trim()) {
      newErrors.district = 'Vui lòng nhập quận/huyện'
    }

    if (!formData.ward.trim()) {
      newErrors.ward = 'Vui lòng nhập phường/xã'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting address form:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Địa chỉ chi tiết */}
        <div>
          <label htmlFor="line1" className="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ chi tiết <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="line1"
            value={formData.line1}
            onChange={(e) => handleInputChange('line1', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.line1 ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Số nhà, tên đường, tên khu phố..."
          />
          {errors.line1 && (
            <p className="mt-1 text-sm text-red-600">{errors.line1}</p>
          )}
        </div>

        {/* Tỉnh/Thành phố */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh..."
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        {/* Quận/Huyện */}
        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
            Quận/Huyện <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="district"
            value={formData.district}
            onChange={(e) => handleInputChange('district', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.district ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ví dụ: Quận Ba Đình, Huyện Củ Chi..."
          />
          {errors.district && (
            <p className="mt-1 text-sm text-red-600">{errors.district}</p>
          )}
        </div>

        {/* Phường/Xã */}
        <div>
          <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
            Phường/Xã <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="ward"
            value={formData.ward}
            onChange={(e) => handleInputChange('ward', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.ward ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ví dụ: Phường Phúc Xá, Xã Tân Thông Hội..."
          />
          {errors.ward && (
            <p className="mt-1 text-sm text-red-600">{errors.ward}</p>
          )}
        </div>

        {/* Đặt làm địa chỉ mặc định */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_default"
            checked={formData.is_default}
            onChange={(e) => handleInputChange('is_default', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700">
            Đặt làm địa chỉ mặc định
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#6a9739] border border-transparent rounded-md hover:bg-[#527a2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6a9739] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang lưu...' : submitText}
          </button>
        </div>
      </form>
    </div>
  )
}
