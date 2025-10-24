'use client'

import { motion } from 'framer-motion'

const features = [
  {
    id: 1,
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Giao nhanh trong 2 giờ',
    description: 'Đơn nội thành xử lý ngay, đảm bảo tươi ngon'
  },
  {
    id: 2,
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Nguồn hàng minh bạch',
    description: 'Hợp tác cùng nhà vườn/HTX uy tín trên khắp cả nước'
  },
  {
    id: 3,
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Đổi trả dễ dàng',
    description: 'Hoàn tiền/đổi sản phẩm nếu có vấn đề về chất lượng'
  },
  {
    id: 4,
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Giá tốt mỗi ngày',
    description: 'Nhiều combo tiết kiệm cho bữa cơm gia đình'
  }
]

export default function WhyChooseUs() {
  return (
    <section className="mb-16 bg-gradient-to-br from-[#f4f8f0] to-white rounded-3xl py-12 px-6 shadow-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gradient-primary mb-3">
          Tại sao chọn chúng tôi?
        </h2>
        <p className="text-gray-600 text-lg">
          Cam kết mang đến trải nghiệm mua sắm tốt nhất
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="text-center group"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#6a9739] transition-colors">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
