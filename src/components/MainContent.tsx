'use client'

import { useState, useEffect } from 'react'

interface MainContentProps {
  children: React.ReactNode
}

export default function MainContent({ children }: MainContentProps) {
  const [paddingTop, setPaddingTop] = useState('172px') // Default height của header (48px + 100px + 56px)

  useEffect(() => {
    const updatePadding = () => {
      const header = document.querySelector('header')
      if (header) {
        const height = header.getBoundingClientRect().height
        setPaddingTop(`${height}px`)
      }
    }

    // Initial update
    setTimeout(updatePadding, 100)

    // Update on scroll
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updatePadding()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updatePadding)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updatePadding)
    }
  }, [])

  return (
    <main 
      className="transition-all duration-500 ease-in-out"
      style={{ paddingTop }}
    >
      {children}
    </main>
  )
}
