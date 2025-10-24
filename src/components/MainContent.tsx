'use client'

import { useState, useEffect } from 'react'

interface MainContentProps {
  children: React.ReactNode
}

export default function MainContent({ children }: MainContentProps) {
  const [isTopBannerVisible, setIsTopBannerVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsTopBannerVisible(scrollTop < 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className={`transition-all duration-300 ${
      isTopBannerVisible ? 'pt-40' : 'pt-28'
    }`}>
      {children}
    </main>
  )
}
