'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

interface Slide {
  id: number
  image: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
}

const slides: Slide[] = [
  {
    id: 1,
    image: 'https://st.ourhtmldemo.com/template/organic_store/images/home/slide-1.jpg',
    title: 'Nông sản theo mùa',
    subtitle: 'Tươi mỗi ngày – Giao trong 2 giờ tại nội thành',
    ctaText: 'Mua ngay',
    ctaLink: '/products'
  },
  {
    id: 2,
    image: 'https://st.ourhtmldemo.com/template/organic_store/images/home/slide-2.jpg',
    title: 'Combo rau củ tiết kiệm',
    subtitle: 'Chế biến nhanh – Đủ dinh dưỡng cho cả nhà',
    ctaText: 'Xem combo',
    ctaLink: '/products?category=rau-cu'
  },
  {
    id: 3,
    image: 'https://st.ourhtmldemo.com/template/organic_store/images/home/slide-3.jpg',
    title: 'Hoa quả tươi nhập khẩu',
    subtitle: 'Nguồn gốc rõ ràng – Chất lượng đảm bảo',
    ctaText: 'Khám phá',
    ctaLink: '/products?category=hoa-qua'
  }
]

const titleVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.6, delay: 0.1, ease: [0.6, 0.01, 0.05, 0.95] as [number, number, number, number] }
  }
}

const subtitleVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.6, delay: 0.25, ease: [0.6, 0.01, 0.05, 0.95] as [number, number, number, number] }
  }
}

const ctaVariants = {
  hidden: { scale: 0.96, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.5, delay: 0.4, ease: [0.6, 0.01, 0.05, 0.95] as [number, number, number, number] }
  }
}

export default function HeroSlider() {
  return (
    <section className="relative w-full">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        loop={true}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !bg-white !opacity-50',
          bulletActiveClass: 'swiper-pagination-bullet-active !opacity-100 !bg-white',
        }}
        navigation={{
          nextEl: '.hero-swiper-button-next',
          prevEl: '.hero-swiper-button-prev',
        }}
        className="hero-slider h-[520px] md:h-[620px] lg:h-[720px] overflow-hidden"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={slide.id === 1}
                  sizes="100vw"
                />
                {/* Overlay for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    <motion.h1
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={titleVariants}
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6"
                    >
                      {slide.title}
                    </motion.h1>
                    
                    <motion.p
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={subtitleVariants}
                      className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-8"
                    >
                      {slide.subtitle}
                    </motion.p>
                    
                    <motion.div
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={ctaVariants}
                    >
                      <Link
                        href={slide.ctaLink}
                        className="inline-block bg-gradient-primary text-white px-8 py-3 md:px-10 md:py-4 rounded-full text-base md:text-lg font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      >
                        {slide.ctaText}
                        <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Navigation Buttons */}
        <button className="hero-swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group">
          <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button className="hero-swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group">
          <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </Swiper>

      <style jsx global>{`
        .hero-slider .swiper-pagination {
          bottom: 20px !important;
        }
        .hero-slider .swiper-pagination-bullet {
          width: 12px !important;
          height: 12px !important;
          margin: 0 6px !important;
        }
        .hero-slider .swiper-pagination-bullet-active {
          width: 32px !important;
          border-radius: 6px !important;
        }
      `}</style>
    </section>
  )
}
