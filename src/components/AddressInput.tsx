'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface AddressSuggestion {
  display_name: string
  lat: number
  lng: number
  address: any
  place_id: string
}

interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  onLocationSelect?: (lat: number, lng: number, address: string) => void
  placeholder?: string
  className?: string
  showMap?: boolean
  mapHeight?: string
}

export default function AddressInput({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Nhập địa chỉ...",
  className = "",
  showMap = true,
  mapHeight = "200px"
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Debounced search function
  const searchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(`/api/geocode/suggestions?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      console.log('Suggestions received:', data)
      setSuggestions(data)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    }
  }, [])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Clear debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new debounce timer
    debounceRef.current = setTimeout(() => {
      searchSuggestions(newValue)
    }, 300)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.display_name)
    setShowSuggestions(false)
    setSelectedLocation({ lat: suggestion.lat, lng: suggestion.lng })
    
    if (onLocationSelect) {
      onLocationSelect(suggestion.lat, suggestion.lng, suggestion.display_name)
    }
  }

  // Handle input focus
  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Load map when component mounts or location is selected
  useEffect(() => {
    if (!showMap || !mapRef.current) return

    const loadMap = async () => {
      try {
        const L = await import('leaflet')
        await import('leaflet/dist/leaflet.css')

        // Fix for default markers in Leaflet with Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Remove existing map
        if (mapInstance) {
          mapInstance.remove()
        }

        // Create new map - default to Ha Noi if no location selected
        const defaultLat = selectedLocation?.lat || 21.0285
        const defaultLng = selectedLocation?.lng || 105.8542
        const map = L.map(mapRef.current).setView([defaultLat, defaultLng], selectedLocation ? 15 : 10)
        setMapInstance(map)

        // Add OSM tiles
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)

        // Remove existing marker
        if (marker) {
          map.removeLayer(marker)
        }

        // Add marker only if location is selected
        if (selectedLocation) {
          const newMarker = L.marker([selectedLocation.lat, selectedLocation.lng])
            .addTo(map)

          setMarker(newMarker)
        }
        setMapLoaded(true)

        // Handle map click to update location
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng
          setSelectedLocation({ lat, lng })

          if (onLocationSelect) {
            onLocationSelect(lat, lng, value)
          }
        })

      } catch (error) {
        console.error('Error loading map:', error)
      }
    }

    loadMap()

    // Cleanup
    return () => {
      if (mapInstance) {
        mapInstance.remove()
        setMapInstance(null)
        setMarker(null)
        setMapLoaded(false)
      }
    }
  }, [showMap]) // Remove selectedLocation dependency to avoid re-rendering map

  // Update marker when selectedLocation changes
  useEffect(() => {
    if (!mapInstance || !selectedLocation) return

    const updateMarker = async () => {
      try {
        const L = await import('leaflet')
        
        // Remove existing marker
        if (marker) {
          mapInstance.removeLayer(marker)
        }

        // Add new marker
        const newMarker = L.marker([selectedLocation.lat, selectedLocation.lng])
          .addTo(mapInstance)

        setMarker(newMarker)

        // Center map on new location
        mapInstance.setView([selectedLocation.lat, selectedLocation.lng], 15)
      } catch (error) {
        console.error('Error updating marker:', error)
      }
    }

    updateMarker()
  }, [selectedLocation, mapInstance])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.place_id}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.display_name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      {showMap && (
        <div className="mt-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Bản đồ vị trí</span>
            <span className="text-xs text-gray-500">(Click để chọn vị trí chính xác)</span>
          </div>
          <div className="relative">
            <div
              ref={mapRef}
              className="w-full rounded-lg border border-gray-300"
              style={{ height: mapHeight }}
            />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-600">Đang tải bản đồ...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
