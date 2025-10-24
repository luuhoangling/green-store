'use client'

import { useState } from 'react'
import AddressInput from '@/components/AddressInput'

export default function TestAddressPage() {
  const [address, setAddress] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null)

  const handleLocationSelect = (lat: number, lng: number, addressText: string) => {
    setSelectedLocation({ lat, lng })
    console.log('Location selected:', { lat, lng, addressText })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Address Input</h1>
        <p className="text-gray-600">Kiểm tra chức năng gợi ý địa chỉ và bản đồ</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nhập địa chỉ</h2>
        
        <AddressInput
          value={address}
          onChange={setAddress}
          onLocationSelect={handleLocationSelect}
          placeholder="Nhập địa chỉ để test gợi ý..."
          showMap={true}
          mapHeight="300px"
          className="w-full"
        />

        {selectedLocation && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-2">Vị trí đã chọn:</h3>
            <p className="text-sm text-green-700">
              <strong>Địa chỉ:</strong> {address}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
