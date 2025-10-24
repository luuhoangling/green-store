/**
 * Price formatting utilities
 */

/**
 * Format price as Vietnamese currency with integer values
 * @param price - The price to format
 * @returns Formatted price string (e.g., "1.000.000 ₫")
 */
export function formatPrice(price: number): string {
  // Handle invalid prices
  if (isNaN(price) || price === null || price === undefined) {
    return '0 ₫'
  }

  // Round to integer
  const roundedPrice = Math.round(price)
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(roundedPrice)
}

/**
 * Format price without currency symbol (for calculations)
 * @param price - The price to format
 * @returns Formatted price string without currency symbol
 */
export function formatPriceNumber(price: number): string {
  if (isNaN(price) || price === null || price === undefined) {
    return '0'
  }

  const roundedPrice = Math.round(price)
  
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(roundedPrice)
}

/**
 * Calculate discount percentage
 * @param originalPrice - Original price
 * @param salePrice - Sale price
 * @returns Discount percentage as integer
 */
export function calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) {
    return 0
  }
  
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}
