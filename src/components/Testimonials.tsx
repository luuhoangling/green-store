'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const testimonials = [
  {
    id: 1,
    name: 'Nguyễn Thị Mai',
    location: 'Hà Nội',
    avatar: 'https://st.ourhtmldemo.com/template/organic_store/images/team/a1.png',
    content: 'Rau củ rất tươi, giao hàng nhanh. Tôi đặt buổi sáng, chiều đã nhận được. Chất lượng tốt, giá cả hợp lý.',
    rating: 5
  },
  {
    id: 2,
    name: 'Trần Văn Hùng',
    location: 'TP. Hồ Chí Minh',
    avatar: 'https://st.ourhtmldemo.com/template/organic_store/images/team/a2.png',
    content: 'Đặc sản vùng miền rất ngon, đúng như mô tả. Shop đóng gói cẩn thận, nhiệt tình. Sẽ tiếp tục ủng hộ.',
    rating: 5
  },
  {
    id: 3,
    name: 'Lê Thị Hương',
    location: 'Đà Nẵng',
    avatar: 'https://st.ourhtmldemo.com/template/organic_store/images/team/a3.png',
    content: 'Hoa quả nhập khẩu rất tươi và ngon. Nguồn gốc rõ ràng, giá tốt hơn siêu thị. Gia đình tôi rất hài lòng.',
    rating: 5
  }
]

export default function Testimonials() {
  return (
    <section className="mb-16 relative overflow-hidden rounded-3xl">
      {/* Background with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920"
          alt="Farm Background"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 py-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Khách hàng nói gì về chúng tôi
          </h2>
          <p className="text-white/90 text-lg">
            Hàng ngàn khách hàng hài lòng trên toàn quốc
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:bg-white transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="relative w-14 h-14 mr-4">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#ffc107]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 text-sm leading-relaxed italic">
                "{testimonial.content}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
