'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface BlogPost {
  id: number
  title: string
  excerpt: string
  image: string
  slug: string
  date: string
  author: string
  category: string
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Mùa nào ăn món gì? Bí quyết chọn rau củ theo mùa',
    excerpt: 'Ăn rau củ theo mùa không chỉ đảm bảo độ tươi ngon mà còn giúp cơ thể hấp thụ tốt nhất các dưỡng chất. Cùng tìm hiểu cách chọn rau củ đúng mùa...',
    image: 'https://st.ourhtmldemo.com/template/organic_store/images/blog/1.jpg',
    slug: 'mua-nao-an-mon-gi',
    date: '15/10/2025',
    author: 'Nguyễn Văn A',
    category: 'Mẹo hay'
  },
  {
    id: 2,
    title: 'Bí quyết chọn hoa quả tươi ngon, tránh hóa chất',
    excerpt: 'Làm thế nào để nhận biết hoa quả tươi ngon, không chứa chất bảo quản? Những mẹo đơn giản giúp bạn chọn được hoa quả an toàn cho gia đình...',
    image: 'https://st.ourhtmldemo.com/template/organic_store/images/blog/2.jpg',
    slug: 'bi-quyet-chon-hoa-qua-tuoi',
    date: '12/10/2025',
    author: 'Trần Thị B',
    category: 'Kiến thức'
  },
  {
    id: 3,
    title: '5 loại rau củ giúp tăng cường miễn dịch mùa đông',
    excerpt: 'Mùa đông là thời điểm cơ thể dễ bị suy giảm miễn dịch. Bổ sung những loại rau củ này sẽ giúp bạn và gia đình khỏe mạnh suốt mùa đông...',
    image: 'https://st.ourhtmldemo.com/template/organic_store/images/blog/3.jpg',
    slug: 'rau-cu-tang-cuong-mien-dich',
    date: '08/10/2025',
    author: 'Lê Văn C',
    category: 'Sức khỏe'
  }
]

export default function BlogTeasers() {
  return (
    <section className="mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gradient-primary mb-3">
          Tin tức & Bài viết
        </h2>
        <p className="text-gray-600 text-lg">
          Cập nhật kiến thức về nông sản và sức khỏe
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
          >
            {/* Image */}
            <Link href={`/blog/${post.slug}`} className="block relative h-64 overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4 bg-gradient-primary text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                {post.category}
              </div>
            </Link>

            {/* Content */}
            <div className="p-6">
              {/* Meta Info */}
              <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{post.author}</span>
                </div>
              </div>

              {/* Title */}
              <Link href={`/blog/${post.slug}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#6a9739] transition-colors">
                  {post.title}
                </h3>
              </Link>

              {/* Excerpt */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              {/* Read More Button */}
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center text-[#6a9739] hover:text-[#527a2d] font-semibold text-sm group/link transition-colors"
              >
                Đọc tiếp
                <svg 
                  className="w-4 h-4 ml-2 transform group-hover/link:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </motion.article>
        ))}
      </div>

      {/* View All Button */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center mt-12"
      >
        <Link
          href="/blog"
          className="inline-flex items-center px-8 py-4 bg-white border-2 border-[#6a9739] text-[#6a9739] rounded-xl font-semibold hover:bg-[#6a9739] hover:text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          Xem tất cả bài viết
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </motion.div>
    </section>
  )
}
