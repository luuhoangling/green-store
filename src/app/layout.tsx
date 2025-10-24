import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { SearchProvider } from "@/lib/search-context";
import { CartProvider } from "@/lib/cart-context";
import { Toaster } from "react-hot-toast";
import { AdminLayoutWrapper } from "@/components/AdminLayoutWrapper";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Green Store - Cửa hàng vật tư điện nước",
  description: "Cửa hàng bán vật tư điện nước chất lượng cao với dịch vụ lắp đặt chuyên nghiệp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>
          <SearchProvider>
            <CartProvider>
              <AdminLayoutWrapper>
                {children}
              </AdminLayoutWrapper>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <ChatWidget />
            </CartProvider>
          </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}