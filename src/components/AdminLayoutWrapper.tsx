'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import TopBanner from '@/components/TopBanner'
import Header from '@/components/Header'
import SearchBar from '@/components/SearchBar'
import MainContent from '@/components/MainContent'
import Footer from '@/components/Footer'

interface AdminLayoutWrapperProps {
  children: ReactNode
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname()
  
  // Nếu là trang admin, chỉ render children (không có header/footer user)
  if (pathname.startsWith('/admin')) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }
  
  // Nếu không phải admin, render layout user bình thường
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBanner />
      <Header />
      <SearchBar />
      <MainContent>
        {children}
      </MainContent>
      <Footer />
    </div>
  )
}
