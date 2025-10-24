'use client'

import { useState } from 'react'

export default function FooterNewsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic email validation
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Email không hợp lệ')
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
      return
    }

    setStatus('loading')
    
    try {
      // TODO: Call your newsletter API endpoint
      // const response = await fetch('/api/newsletter', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // })
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStatus('success')
      setMessage('Đăng ký thành công!')
      setEmail('')
      
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage('Có lỗi xảy ra, vui lòng thử lại')
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    }
  }

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4">Nhận tin khuyến mãi</h4>
      <p className="text-sm text-gray-300 mb-4">
        Đăng ký nhận thông tin ưu đãi, giá sỉ & flash-sale mỗi ngày
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email của bạn"
            disabled={status === 'loading'}
            className="flex-1 px-4 py-2.5 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6a9739] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-[#6a9739] hover:bg-[#527a2d] text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang gửi...
              </span>
            ) : (
              'Đăng ký'
            )}
          </button>
        </div>
        
        {/* Status Message */}
        {message && (
          <div
            className={`text-sm p-2 rounded-lg ${
              status === 'success'
                ? 'bg-green-500/20 text-green-300'
                : 'bg-red-500/20 text-red-300'
            }`}
          >
            {message}
          </div>
        )}
      </form>
      
      <p className="text-xs text-gray-400 mt-3">
        Chúng tôi tôn trọng quyền riêng tư của bạn
      </p>
    </div>
  )
}
