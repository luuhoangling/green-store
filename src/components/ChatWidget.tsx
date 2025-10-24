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
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
    // call chat API
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      const assistantMsg: Msg = { id: String(Date.now() + 1), role: "assistant", text: data.reply, products: data.products };
      setMessages((s) => [...s, assistantMsg]);
    } catch (err) {
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
      <button
        aria-label="Open chat"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center"
      >
        Chat
      </button>

      {open && (
        <div className="fixed bottom-20 left-4 z-50 w-96 max-w-[92vw] h-[70vh] rounded-2xl shadow-2xl bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-indigo-500 to-indigo-400 text-white">
            <div className="font-semibold">Trợ lý cửa hàng</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setOpen(false)} className="text-white/90 hover:text-white">
                Đóng
              </button>
            </div>
          </div>
          <div ref={listRef} className="p-3 overflow-auto flex-1 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] p-3 rounded-2xl shadow-sm ${m.role === "user" ? "bg-indigo-100 text-slate-900" : "bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"}`}>
                  {m.text && (
                    // @ts-ignore
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  )}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-3">
                      <ProductList products={m.products} showDetailButton={true} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t bg-white dark:bg-slate-900">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Viết câu hỏi..."
                className="flex-1 rounded-xl border px-3 py-2 bg-gray-50 dark:bg-slate-800 text-sm"
              />
              <button onClick={sendMessage} className="px-3 py-2 rounded-xl bg-indigo-600 text-white">
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
