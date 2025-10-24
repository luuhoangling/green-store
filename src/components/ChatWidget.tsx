"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import ProductList from "./ProductList";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

type Msg = {
  id: string;
  role: "user" | "assistant" | "system";
  text?: string;
  products?: any[];
};

export default function ChatWidget() {
  const pathname = usePathname();
  
  // Ẩn chatbot khi ở trang admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => []);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [shake, setShake] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Hiệu ứng lắc lắc định kỳ để thu hút sự chú ý
  useEffect(() => {
    if (!open) {
      const interval = setInterval(() => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }, 5000); // Lắc mỗi 5 giây
      return () => clearInterval(interval);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // initial message
    if (messages.length === 0) {
      setMessages([
        { id: "m1", role: "assistant", text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?" },
      ]);
    }
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);


  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg: Msg = { id: String(Date.now()), role: "user", text: input };
    setMessages((s) => [...s, userMsg]);
    setInput("");
    setIsTyping(true);
    
    // call chat API
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setIsTyping(false);
      const assistantMsg: Msg = { id: String(Date.now() + 1), role: "assistant", text: data.reply, products: data.products };
      setMessages((s) => [...s, assistantMsg]);
    } catch (err) {
      setIsTyping(false);
      setMessages((s) => [...s, { id: String(Date.now() + 2), role: "assistant", text: "Có lỗi khi gửi yêu cầu. Thử lại sau." }]);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }


  return (
    <div>
      {/* CSS cho hiệu ứng */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes typing {
          0%, 20%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        
        .shake-animation {
          animation: shake 0.5s ease-in-out;
        }
        
        .pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .slide-in {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      
      <button
        aria-label="Open chat"
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 left-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-[#6a9739] to-[#527a2d] text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 ${shake ? 'shake-animation' : ''}`}
      >
        {/* Vòng tròn phát sáng xung quanh nút */}
        <span className="absolute w-full h-full rounded-full bg-[#6a9739] opacity-50 pulse-ring"></span>
        
        {/* Icon chat */}
        <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        
        {/* Badge thông báo */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-bounce">
            !
          </span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-28 left-6 z-50 w-[360px] max-w-[92vw] h-[500px] rounded-3xl shadow-2xl bg-white dark:bg-slate-900 flex flex-col overflow-hidden border-2 border-gray-100 dark:border-slate-800 slide-in">
          {/* Header với gradient đẹp hơn */}
          <div className="relative flex items-center justify-between p-3 bg-gradient-to-r from-[#6a9739] via-[#7ca843] to-[#6a9739] text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-base">Trợ lý ảo</div>
                <div className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                  Đang hoạt động
                </div>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)} 
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Messages area với styling đẹp hơn */}
          <div ref={listRef} className="p-3 overflow-auto flex-1 space-y-3 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} slide-in`}>
                <div className={`max-w-[80%] p-3 rounded-xl shadow-md transition-all hover:shadow-lg ${
                  m.role === "user" 
                    ? "bg-gradient-to-br from-[#6a9739] to-[#7ca843] text-white rounded-br-sm" 
                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm border border-gray-200 dark:border-slate-700"
                }`}>
                  {m.text && (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {/* @ts-ignore */}
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  )}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-3">
                      <ProductList products={m.products} showDetailButton={true} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start slide-in">
                <div className="bg-white dark:bg-slate-800 rounded-xl rounded-bl-sm p-3 shadow-md border border-gray-200 dark:border-slate-700">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" style={{animation: 'typing 1.4s infinite', animationDelay: '0s'}}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" style={{animation: 'typing 1.4s infinite', animationDelay: '0.2s'}}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" style={{animation: 'typing 1.4s infinite', animationDelay: '0.4s'}}></span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area với styling đẹp hơn */}
          <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Nhập câu hỏi..."
                className="flex-1 rounded-xl border-2 border-gray-200 dark:border-slate-700 px-3 py-2 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#6a9739] focus:ring-2 focus:ring-[#6a9739]/20 transition-all"
              />
              <button 
                onClick={sendMessage} 
                disabled={!input.trim() || isTyping}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#6a9739] to-[#7ca843] text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
