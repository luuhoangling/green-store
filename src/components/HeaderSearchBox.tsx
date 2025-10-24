'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SearchSuggestion {
  name: string
  slug?: string
  category_name?: string
  type: 'product' | 'category'
}

export default function HeaderSearchBox() {
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions
  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=5`)
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(data.data)
        setShowSuggestions(data.data.length > 0)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Debounce suggestions fetch
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setShowSearch(false)
      setShowSuggestions(false)
      router.push(`/products?search=${encodeURIComponent(query)}`)
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery('')
    setShowSearch(false)
    setShowSuggestions(false)
    
    if (suggestion.type === 'product' && suggestion.slug) {
      router.push(`/products/${suggestion.slug}`)
    } else if (suggestion.type === 'category' && suggestion.slug) {
      router.push(`/categories/${suggestion.slug}`)
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      {/* Desktop: Search Icon Button */}
      <button
        onClick={() => setShowSearch(!showSearch)}
        className="hidden lg:flex p-2 hover:bg-[#f4f8f0] rounded-lg transition-all duration-200 group"
        aria-label="Tìm kiếm"
      >
        <svg className="w-6 h-6 text-gray-700 group-hover:text-[#6a9739]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Mobile: Always show icon (opens modal) */}
      <button
        onClick={() => setShowSearch(!showSearch)}
        className="lg:hidden p-2 hover:bg-[#f4f8f0] rounded-lg transition-all duration-200"
        aria-label="Tìm kiếm"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Search Dropdown/Modal */}
      {showSearch && (
        <>
          {/* Mobile: Full screen overlay */}
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowSearch(false)}></div>
          
          {/* Search Box */}
          <div className="lg:absolute lg:right-0 lg:top-full lg:mt-2 lg:w-96 fixed lg:relative inset-x-0 top-20 lg:top-auto mx-4 lg:mx-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-200">
            <form onSubmit={handleSearch} className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm sản phẩm, danh mục..."
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true)
                    }
                  }}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6a9739] focus:border-transparent text-sm"
                />
                <svg 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="mt-2 border-t border-gray-100 max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${index}`}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-3 py-2.5 text-left hover:bg-[#f4f8f0] flex items-start gap-3 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {suggestion.type === 'product' ? (
                          <svg className="w-4 h-4 text-[#6a9739]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {suggestion.name}
                        </div>
                        {suggestion.category_name && (
                          <div className="text-xs text-gray-500 truncate">
                            {suggestion.category_name}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {suggestion.type === 'product' ? 'SP' : 'DM'}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="mt-2 py-4 text-center border-t border-gray-100">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#6a9739] mx-auto"></div>
                  <p className="mt-2 text-xs text-gray-500">Đang tìm...</p>
                </div>
              )}

              {/* No Results */}
              {!isLoading && query.length >= 2 && suggestions.length === 0 && showSuggestions && (
                <div className="mt-2 py-4 text-center border-t border-gray-100">
                  <p className="text-sm text-gray-500">Không tìm thấy kết quả</p>
                </div>
              )}

              {/* Search Button */}
              <button
                type="submit"
                className="w-full mt-3 bg-gradient-primary text-white py-2.5 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                Tìm kiếm
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
