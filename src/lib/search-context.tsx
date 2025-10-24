'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  performSearch: (query: string) => void
  clearSearch: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Sync with URL params on mount
  useEffect(() => {
    const query = searchParams.get('q') || ''
    setSearchQuery(query)
  }, [searchParams])

  const performSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/products')
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    router.push('/products')
  }

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      performSearch,
      clearSearch
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
