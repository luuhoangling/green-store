'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import HeaderWrapper from '@/components/HeaderWrapper'
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
      <HeaderWrapper />
      <MainContent>
        {children}
      </MainContent>
      <Footer />
    </div>
  )
}
