'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearch } from '@/lib/search-context'
import Link from 'next/link'

interface SearchSuggestion {
  name: string
  slug?: string
  brand?: string
  category_name?: string
  type: 'product' | 'category' | 'brand'
  relevanceScore: number
}

export default function SearchBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const { searchQuery, setSearchQuery, performSearch } = useSearch()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      // Ẩn search bar khi cuộn xuống hơn 100px
      setIsVisible(scrollTop < 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch search suggestions
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoadingSuggestions(true)
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=8`)
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(data.data)
        setShowSuggestions(data.data.length > 0)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    performSearch(searchQuery)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Debounce suggestions fetch
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.name)
    setShowSuggestions(false)
    
    // Navigate based on suggestion type
    if (suggestion.type === 'product' && suggestion.slug) {
      window.location.href = `/products/${suggestion.slug}`
    } else if (suggestion.type === 'category' && suggestion.slug) {
      window.location.href = `/categories/${suggestion.slug}`
    } else {
      performSearch(suggestion.name)
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      case 'category':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )
      case 'brand':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div 
      className={`fixed left-0 right-0 z-30 bg-white border-b transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
      }`}
      style={{ top: '112px' }} // TopBanner (48px) + Header (64px) = 112px
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex justify-center">
          <div className="relative w-full max-w-2xl" ref={suggestionsRef}>
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm, danh mục, thương hiệu..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true)
                    }
                  }}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {isLoadingSuggestions ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm">Đang tìm kiếm...</p>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="py-2">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={`${suggestion.type}-${suggestion.name}-${index}`}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                          >
                            {getSuggestionIcon(suggestion.type)}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {suggestion.name}
                              </div>
                              {suggestion.brand && (
                                <div className="text-sm text-gray-500 truncate">
                                  Thương hiệu: {suggestion.brand}
                                </div>
                              )}
                              {suggestion.category_name && (
                                <div className="text-sm text-gray-500 truncate">
                                  Danh mục: {suggestion.category_name}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 capitalize">
                              {suggestion.type === 'product' ? 'Sản phẩm' : 
                               suggestion.type === 'category' ? 'Danh mục' : 'Thương hiệu'}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : searchQuery.length >= 2 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">Không tìm thấy gợi ý nào</p>
                        <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Tìm kiếm
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
