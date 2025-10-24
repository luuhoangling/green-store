'use client'

import HeroSlider from '@/components/HeroSlider'
import CategoryStrip from '@/components/CategoryStrip'
import FeaturedProductsWithTabs from '@/components/FeaturedProductsWithTabs'
import WhyChooseUs from '@/components/WhyChooseUs'
import TopSellingGallery from '@/components/TopSellingGallery'
import FarmersPartners from '@/components/FarmersPartners'
import Testimonials from '@/components/Testimonials'
import BlogTeasers from '@/components/BlogTeasers'
import Newsletter from '@/components/Newsletter'
import ScrollToTop from '@/components/ScrollToTop'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 1. Hero Slider - Full width */}
      <HeroSlider />
      
      {/* Container cho tất cả các section còn lại */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 2. Category Strip */}
        <CategoryStrip />
        
        {/* 3. Featured Products With Tabs */}
        <FeaturedProductsWithTabs />
        
        {/* 4. Why Choose Us */}
        <WhyChooseUs />
        
        {/* 5. Top Selling Gallery */}
        <TopSellingGallery />
        
        {/* 6. Farmers Partners */}
        <FarmersPartners />
        
        {/* 7. Testimonials */}
        <Testimonials />
        
        {/* 8. Blog Teasers */}
        <BlogTeasers />
        
        {/* 9. Newsletter CTA */}
        <Newsletter />
        
      </div>
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}
