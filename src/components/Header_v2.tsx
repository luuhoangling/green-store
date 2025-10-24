'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  ShoppingCart,
  Search,
  ChevronDown,
  Menu,
  X,
  Phone,
  Mail,
  Heart,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  children?: Category[];
}

interface HeaderProps {
  logoSrc?: string;
  nav?: NavItem[];
  cartCount?: number;
  cartTotal?: number;
  wishlistCount?: number;
  phoneNumber?: string;
  email?: string;
  languages?: { code: string; label: string; flag?: string }[];
  currentLanguage?: string;
  onSearch?: (q: string) => void;
  onLanguageChange?: (code: string) => void;
  isLoggedIn?: boolean;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_NAV: NavItem[] = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Giới thiệu', href: '/about' },
  {
    label: 'Sản phẩm',
    href: '/products',
    children: [
      { label: 'Tất cả sản phẩm', href: '/products' },
      { label: 'Khuyến mãi', href: '/products?sale=true' },
    ],
  },
  {
    label: 'Tin tức',
    href: '/news',
    children: [
      { label: 'Tin mới nhất', href: '/news/latest' },
      { label: 'Hướng dẫn', href: '/news/guides' },
    ],
  },
  {
    label: 'Danh mục',
    href: '/categories',
    children: [
      { label: 'Rau - Củ - Quả', href: '/categories/rau-cu-qua' },
      { label: 'Thịt - Phụ phẩm', href: '/categories/thit-phu-pham' },
      { label: 'Thủy sản', href: '/categories/thuy-san' },
      { label: 'Gạo - Ngũ cốc', href: '/categories/gao-ngu-coc' },
    ],
  },
  {
    label: 'Trang khác',
    href: '/pages',
    children: [
      { label: 'Câu hỏi thường gặp', href: '/faq' },
      { label: 'Chính sách', href: '/policy' },
    ],
  },
  { label: 'Liên hệ', href: '/contact' },
];

const DEFAULT_LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Header({
  logoSrc = '/logo.jpeg',
  nav = DEFAULT_NAV,
  cartCount = 0,
  cartTotal = 0,
  wishlistCount = 0,
  phoneNumber = '+84 123 456 789',
  email = 'admin@greenstore.com',
  languages = DEFAULT_LANGUAGES,
  currentLanguage = 'vi',
  onSearch,
  onLanguageChange,
  isLoggedIn = false,
  userName = '',
  userRole = 'user',
  onLogout,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [openMobileAccordion, setOpenMobileAccordion] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hideTopBars, setHideTopBars] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>(nav);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.data);
          
          // Build navigation items with dynamic categories
          const categoryNavItems = data.data.map((category: Category) => ({
            label: category.name,
            href: `/categories/${category.slug}`
          }));

          // Update nav items with dynamic categories
          const updatedNav = nav.map(item => {
            if (item.label === 'Danh mục') {
              return {
                ...item,
                children: categoryNavItems
              };
            }
            return item;
          });
          
          setNavItems(updatedNav);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Keep default navigation if fetch fails
        setNavItems(nav);
      }
    };

    fetchCategories();
  }, []);


  // Sticky scroll detection with top bars hiding
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide top bars when scrolling down past 100px
      if (currentScrollY > 100) {
        setHideTopBars(true);
        setIsScrolled(true);
      } else {
        setHideTopBars(false);
        setIsScrolled(currentScrollY > 10);
      }
      
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Header_v2 handleSearchSubmit called with searchQuery:', searchQuery);
    if (onSearch && searchQuery.trim()) {
      console.log('Calling onSearch with:', searchQuery);
      onSearch(searchQuery);
      // Keep the search query in the input for user reference
    }
  };

  const currentLang = languages.find((l) => l.code === currentLanguage) || languages[0];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-500 ease-in-out"
      style={{
        boxShadow: isScrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
      }}
    >
      {/* ====================================================================== */}
      {/* TIER 1 - TOP BAR */}
      {/* ====================================================================== */}
      <div 
        className="bg-gray-100 border-b border-gray-200 transition-all duration-500 ease-in-out"
        style={{
          height: hideTopBars ? '0px' : '48px',
          opacity: hideTopBars ? 0 : 1,
          overflow: 'hidden'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12 text-sm">
            {/* LEFT - Contact Info */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>Phone:</span>
                <a
                  href={`tel:${phoneNumber}`}
                  className="text-lime-600 hover:text-lime-700 font-semibold"
                >
                  {phoneNumber}
                </a>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-gray-600 hover:text-lime-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>{email}</span>
              </a>
            </div>

            {/* RIGHT - Account, Wishlist, Language */}
            <div className="flex items-center gap-4 ml-auto">
              <Link
                href="/me"
                className="flex items-center gap-1.5 text-gray-600 hover:text-lime-600 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Tài khoản</span>
              </Link>

              <Link
                href="/wishlist"
                className="flex items-center gap-1.5 text-gray-600 hover:text-lime-600 transition-colors relative"
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Yêu thích</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-lime-600 transition-colors focus:outline-none"
                >
                  <span>{currentLang.flag}</span>
                  <span className="hidden sm:inline">{currentLang.label}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showLanguageMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 min-w-[140px] z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange?.(lang.code);
                          setShowLanguageMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* TIER 2 - MAIN HEADER (Search | Logo | Sign In + Cart) */}
      {/* ====================================================================== */}
      <div 
        className="border-b border-gray-200 transition-all duration-500 ease-in-out relative z-30"
        style={{
          height: hideTopBars ? '0px' : 'auto',
          opacity: hideTopBars ? 0 : 1,
          overflow: hideTopBars ? 'hidden' : 'visible'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="relative flex items-center gap-4 py-6">
            {/* LEFT - Search Box */}
            <div className="hidden md:block flex-1 max-w-xs">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    name="q"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-lime-600 transition-colors"
                    aria-label="Tìm kiếm"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* CENTER - Logo (Absolute Center) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link
                href="/"
                className="focus:outline-none focus:ring-2 focus:ring-lime-500 rounded block"
              >
                <Image
                  src={logoSrc}
                  alt="Logo"
                  width={200}
                  height={60}
                  className="object-contain h-14 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* RIGHT - Welcome/Sign In + Cart */}
            <div className="flex items-center gap-4 flex-1 justify-end ml-auto">
              {/* Welcome / Sign In - With Dropdown */}
              <div 
                className="hidden md:block relative"
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <button
                  className="flex items-center gap-3 group cursor-pointer focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-lime-100 transition-colors">
                    <User className="w-5 h-5 text-gray-600 group-hover:text-lime-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-500">
                      {isLoggedIn ? 'Xin chào!' : 'Xin chào!'}
                    </div>
                    <div className="text-sm font-semibold text-gray-700 group-hover:text-lime-600 flex items-center gap-1">
                      {isLoggedIn && userName ? userName : 'Đăng nhập'}
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full pt-1 z-[9999]">
                    <div className="w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2">
                      {isLoggedIn ? (
                        <>
                          <Link
                            href="/me"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-lime-50 hover:text-lime-700 transition-colors"
                          >
                            <span className="w-4 flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </span>
                            <span>Tài khoản của tôi</span>
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-lime-50 hover:text-lime-700 transition-colors"
                          >
                            <span className="w-4 flex items-center justify-center">
                              <ShoppingCart className="w-4 h-4" />
                            </span>
                            <span>Đơn hàng</span>
                          </Link>
                          {userRole === 'admin' && (
                            <Link
                              href="/admin/orders"
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-lime-50 hover:text-lime-700 transition-colors"
                            >
                              <span className="w-4 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </span>
                              <span>Quản trị</span>
                            </Link>
                          )}
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => {
                              if (onLogout) {
                                onLogout();
                              }
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <span className="w-4 flex items-center justify-center">
                              <X className="w-4 h-4" />
                            </span>
                            <span>Đăng xuất</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-lime-50 hover:text-lime-700 transition-colors"
                          >
                            <span className="w-4 flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </span>
                            <span>Đăng nhập</span>
                          </Link>
                          <Link
                            href="/register"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-lime-50 hover:text-lime-700 transition-colors"
                          >
                            <span className="w-4 flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </span>
                            <span>Đăng ký</span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className="flex items-center gap-3 group relative"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-lime-600 flex items-center justify-center group-hover:bg-lime-700 transition-colors">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs text-gray-500">Giỏ hàng</div>
                  <div className="text-sm font-bold text-lime-600">
                    {cartTotal.toLocaleString('vi-VN')}₫
                  </div>
                </div>
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-gray-700 hover:text-lime-600 focus:outline-none focus:ring-2 focus:ring-lime-500 rounded p-2"
                aria-label="Mở menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* TIER 3 - NAVIGATION BAR */}
      {/* ====================================================================== */}
      <div className="bg-lime-600">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center">
              {navItems.map((item, idx) => (
                <div
                  key={idx}
                  className="relative group"
                  onMouseEnter={() => item.children && setOpenDropdown(idx)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 px-6 py-4 text-white hover:bg-lime-700 transition-colors font-medium text-sm"
                  >
                    {item.label}
                    {item.children && <ChevronDown className="w-4 h-4" />}
                  </Link>

                  {/* Dropdown panel */}
                  {item.children && openDropdown === idx && (
                    <div className="absolute top-full left-0 bg-white rounded-b shadow-lg border-t-2 border-lime-600 py-2 min-w-[200px] z-50">
                      {item.children.map((child, childIdx) => (
                        <Link
                          key={childIdx}
                          href={child.href}
                          className="block px-4 py-2 text-gray-700 hover:bg-lime-50 hover:text-lime-700 transition-colors text-sm"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Action Icons when scrolled + Social Icons */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Search icon khi scroll */}
              <button
                onClick={() => {
                  const searchInput = document.querySelector('input[name="q"]') as HTMLInputElement;
                  if (searchInput) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => searchInput.focus(), 300);
                  }
                }}
                className={`transition-all duration-500 ease-in-out ${
                  hideTopBars
                    ? 'w-10 h-10 opacity-100 translate-x-0'
                    : 'w-0 h-0 opacity-0 translate-x-4 overflow-hidden'
                } rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-lime-600`}
                aria-label="Tìm kiếm"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Cart icon khi scroll */}
              <Link
                href="/cart"
                className={`relative transition-all duration-500 ease-in-out ${
                  hideTopBars
                    ? 'w-10 h-10 opacity-100 translate-x-0'
                    : 'w-0 h-0 opacity-0 translate-x-4 overflow-hidden'
                } rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-lime-600`}
                aria-label="Giỏ hàng"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Social Icons - ẩn khi scroll */}
              <a
                href="#"
                className={`transition-all duration-500 ease-in-out ${
                  hideTopBars
                    ? 'w-0 h-0 opacity-0 translate-x-4 overflow-hidden'
                    : 'w-10 h-10 opacity-100 translate-x-0'
                } rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-lime-600`}
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className={`transition-all duration-500 ease-in-out ${
                  hideTopBars
                    ? 'w-0 h-0 opacity-0 translate-x-4 overflow-hidden'
                    : 'w-10 h-10 opacity-100 translate-x-0'
                } rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-lime-600`}
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className={`transition-all duration-500 ease-in-out ${
                  hideTopBars
                    ? 'w-0 h-0 opacity-0 translate-x-4 overflow-hidden'
                    : 'w-10 h-10 opacity-100 translate-x-0'
                } rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-lime-600`}
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className={`transition-all duration-500 ease-in-out ${
                  hideTopBars
                    ? 'w-0 h-0 opacity-0 translate-x-4 overflow-hidden'
                    : 'w-10 h-10 opacity-100 translate-x-0'
                } rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-lime-600`}
                aria-label="Pinterest"
              >
                <div className="w-4 h-4 flex items-center justify-center font-bold">P</div>
              </a>
            </div>

            {/* Mobile: show simple text */}
            <div className="lg:hidden py-3 text-white font-semibold">
              CỬA HÀNG XANH
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* MOBILE DRAWER */}
      {/* ====================================================================== */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-[86%] max-w-sm bg-white z-50 lg:hidden overflow-y-auto shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-lime-600">
              <Image
                src={logoSrc}
                alt="Logo"
                width={120}
                height={36}
                className="object-contain"
              />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-lime-100 focus:outline-none focus:ring-2 focus:ring-white rounded p-1"
                aria-label="Đóng menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-gray-200">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    name="q"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-lime-600"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Mobile Nav */}
            <nav className="py-2">
              {navItems.map((item, idx) => (
                <div key={idx} className="border-b border-gray-100">
                  {item.children ? (
                    <>
                      {/* Accordion trigger */}
                      <button
                        onClick={() =>
                          setOpenMobileAccordion(openMobileAccordion === idx ? null : idx)
                        }
                        className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium focus:outline-none"
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-200 ${
                            openMobileAccordion === idx ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Accordion content */}
                      {openMobileAccordion === idx && (
                        <div className="bg-gray-50">
                          {item.children.map((child, childIdx) => (
                            <Link
                              key={childIdx}
                              href={child.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block px-8 py-2 text-gray-600 hover:text-lime-700 hover:bg-lime-50 transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

/**
 * ============================================================================
 * CÁCH SỬ DỤNG
 * ============================================================================
 * 
 * Import vào component wrapper để kết nối với context:
 * 
 *    import Header from '@/components/Header_v2';
 *    import { useCart } from '@/lib/cart-context';
 *    import { useAuth } from '@/lib/auth-context';
 * 
 *    export default function HeaderWrapper() {
 *      const { cartItemCount, cart } = useCart();
 *      const { user, token } = useAuth();
 *      
 *      const cartTotal = cart?.items.reduce((sum, item) => 
 *        sum + (item.qty * item.unitPriceSnapshot), 0
 *      ) || 0;
 * 
 *      return (
 *        <Header
 *          cartCount={cartItemCount}
 *          cartTotal={cartTotal}
 *          isLoggedIn={!!token}
 *          userName={user?.name}
 *        />
 *      );
 *    }
 * 
 * ============================================================================
 */
