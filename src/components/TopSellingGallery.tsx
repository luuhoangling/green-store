'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'

interface GalleryItem {
  id: number
  image: string
  title: string
  price: number
  slug?: string
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    image: 'https://st.ourhtmldemo.com/template/organic_store/images/gallery/1.jpg',
    title: 'Combo rau củ tươi ngon',
    price: 150000
  },
  {
    id: 2,
    image: 'https://st.ourhtmldemo.com/template/organic_store/images/gallery/2.jpg',
    title: 'Hoa quả nhập khẩu cao cấp',
    price: 250000
  },
  {
    id: 3,
    image: 'https://st.ourhtmldemo.com/template/organic_store/images/gallery/3.jpg',
    title: 'Gạo thơm đặc biệt',
    price: 180000
  },
  {
    id: 4,
    image: 'https://st.ourhtmldemo.com/template/organic_store/images/gallery/4.jpg',
    title: 'Thịt tươi sạch',
    price: 200000
  },
  {
    id: 5,
    image: 'https://st.ourhtmldemo.com/template/organic_store/images/gallery/5.jpg',
    title: 'Hải sản tươi sống',
    price: 300000
  },
  {
    id: 6,
    image: 'https://st.ourhtmldemo.com/template/organic_store/images/gallery/6.jpg',
    title: 'Đặc sản vùng miền',
    price: 220000
  }
]

export default function TopSellingGallery() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  const handleAddToCart = (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement add to cart
    console.log('Add to cart:', item.id)
  }

  const closeLightbox = () => {
    setSelectedItem(null)
  }

  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedItem])

  return (
    <section className="mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gradient-primary mb-3">
          Combo bán chạy
        </h2>
        <p className="text-gray-600 text-lg">
          Những combo được yêu thích nhất
        </p>
      </motion.div>

      {/* Desktop: Masonry Grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {galleryItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative group cursor-pointer overflow-hidden rounded-2xl ${
              index === 0 || index === 5 ? 'md:row-span-2' : ''
            }`}
            onClick={() => setSelectedItem(item)}
          >
            <div className="relative w-full h-full min-h-[300px]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              
              {/* Dark Overlay on Hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300" />
              
              {/* Icons on Hover */}
              <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white hover:bg-[#6a9739] text-gray-800 hover:text-white p-4 rounded-full shadow-2xl transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedItem(item)
                  }}
                  aria-label="Phóng to ảnh"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white hover:bg-[#6a9739] text-gray-800 hover:text-white p-4 rounded-full shadow-2xl transition-colors duration-200"
                  onClick={(e) => handleAddToCart(item, e)}
                  aria-label="Thêm vào giỏ"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </motion.button>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-[#ffc107] font-bold text-xl">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile: Swiper Carousel */}
      <div className="md:hidden">
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={16}
          slidesPerView={1.2}
          centeredSlides={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          loop={true}
          navigation={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
              centeredSlides: false
            }
          }}
          className="top-selling-swiper"
        >
          {galleryItems.map((item) => (
            <SwiperSlide key={item.id}>
              <div
                className="relative group cursor-pointer overflow-hidden rounded-2xl h-[400px]"
                onClick={() => setSelectedItem(item)}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 90vw, 45vw"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-[#ffc107] font-bold text-xl mb-3">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                  </p>
                  <button
                    onClick={(e) => handleAddToCart(item, e)}
                    className="w-full bg-gradient-primary text-white py-2 rounded-lg font-semibold"
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
                aria-label="Đóng"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="relative h-[400px] md:h-[500px]">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col justify-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {selectedItem.title}
                  </h2>
                  <p className="text-4xl font-bold text-[#6a9739] mb-6">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedItem.price)}
                  </p>
                  <p className="text-gray-600 mb-6">
                    Combo được yêu thích nhất, đảm bảo chất lượng tươi ngon, giá trị dinh dưỡng cao.
                  </p>
                  <button
                    onClick={(e) => handleAddToCart(selectedItem, e)}
                    className="w-full bg-gradient-primary text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .top-selling-swiper .swiper-button-next,
        .top-selling-swiper .swiper-button-prev {
          color: white;
          background: rgba(106, 151, 57, 0.8);
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
        .top-selling-swiper .swiper-button-next:after,
        .top-selling-swiper .swiper-button-prev:after {
          font-size: 18px;
        }
      `}</style>
    </section>
  )
}
