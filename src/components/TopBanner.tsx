'use client'

import { useState, useEffect } from 'react'

export default function TopBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [currentSloganIndex, setCurrentSloganIndex] = useState(0)

  const slogans = [
    "Nông sản sạch - Chất lượng cao",
    "An toàn thực phẩm - Sức khỏe gia đình", 
    "Green Store - Đối tác tin cậy"
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      // Ẩn banner khi cuộn xuống hơn 100px
      setIsVisible(scrollTop < 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-rotate slogans every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSloganIndex((prev) => (prev + 1) % slogans.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [slogans.length])

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 to-green-700 text-white transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-8">
          <div className="text-center">
            <div 
              key={currentSloganIndex}
              className="text-[15px] font-normal animate-fade-in"
            >
              {slogans[currentSloganIndex]}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
