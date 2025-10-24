'use client';

import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { useSearch } from '@/lib/search-context';
import { useRouter } from 'next/navigation';
import Header from './Header_v2';

/**
 * Wrapper component để kết nối Header với CartContext, AuthContext và xử lý search
 */
export default function HeaderWrapper() {
  const { cartItemCount, cart } = useCart();
  const { user, token, logout } = useAuth();
  const { performSearch } = useSearch();
  const router = useRouter();

  // Tính tổng giá trị giỏ hàng
  const cartTotal = cart?.items.reduce((sum, item) => 
    sum + (item.qty * item.unitPriceSnapshot), 0
  ) || 0;

  const handleSearch = (query: string) => {
    console.log('HeaderWrapper handleSearch called with:', query);
    if (query.trim()) {
      // Use performSearch from SearchContext which handles both state and navigation
      performSearch(query.trim());
    }
  };

  const handleLanguageChange = (code: string) => {
    // TODO: Implement language change logic
    console.log('Language changed to:', code);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <Header
      logoSrc="/logo.jpeg"
      cartCount={cartItemCount}
      cartTotal={cartTotal}
      wishlistCount={0} // TODO: Implement wishlist count from context
      isLoggedIn={!!token}
      userName={user?.name || ''}
      userRole={user?.role || 'user'}
      onSearch={handleSearch}
      onLanguageChange={handleLanguageChange}
      onLogout={handleLogout}
    />
  );
}
