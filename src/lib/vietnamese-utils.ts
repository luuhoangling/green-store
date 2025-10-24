/**
 * Vietnamese text processing utilities for search functionality
 */

// Vietnamese diacritics mapping
const VIETNAMESE_DIACRITICS: { [key: string]: string } = {
  'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
  'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
  'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
  'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
  'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
  'đ': 'd',
  'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A', 'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
  'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
  'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
  'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
  'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
  'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
  'Đ': 'D'
}

// Common Vietnamese search terms and their variations
const VIETNAMESE_SEARCH_VARIATIONS: { [key: string]: string[] } = {
  'điện': ['dien', 'điện', 'đèn', 'den'],
  'nước': ['nuoc', 'nước', 'nươc'],
  'công tắc': ['cong tac', 'công tắc', 'congtac', 'côngtắc'],
  'ổ cắm': ['o cam', 'ổ cắm', 'ocam', 'ổcắm'],
  'bơm': ['bom', 'bơm', 'bom nuoc', 'bơm nước'],
  'quạt': ['quat', 'quạt', 'quat hut', 'quạt hút'],
  'đèn': ['den', 'đèn', 'den led', 'đèn led'],
  'dây': ['day', 'dây', 'day dien', 'dây điện'],
  'cáp': ['cap', 'cáp', 'cap dien', 'cáp điện'],
  'van': ['van', 'văn', 'van nuoc', 'văn nước'],
  'vòi': ['voi', 'vòi', 'voi nuoc', 'vòi nước'],
  'sen': ['sen', 'sen voi', 'sen vòi'],
  'bếp': ['bep', 'bếp', 'bep tu', 'bếp từ'],
  'máy': ['may', 'máy', 'may bom', 'máy bơm'],
  'thiết bị': ['thiet bi', 'thiết bị', 'thietbi', 'thiếtbị'],
  'vật tư': ['vat tu', 'vật tư', 'vattu', 'vậttư'],
  'lắp đặt': ['lap dat', 'lắp đặt', 'lapdat', 'lắpđặt'],
  'ống': ['ong', 'ống', 'ong nhua', 'ống nhựa'],
  'nhựa': ['nhua', 'nhựa', 'nhua ppr', 'nhựa ppr'],
  'inox': ['inox', 'inox 304', 'inox 316'],
  'thép': ['thep', 'thép', 'thep khong gi', 'thép không gỉ']
}

/**
 * Remove Vietnamese diacritics from text
 */
export function removeVietnameseDiacritics(text: string): string {
  return text.replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g, (char) => {
    return VIETNAMESE_DIACRITICS[char] || char
  })
}

/**
 * Normalize Vietnamese text for search
 */
export function normalizeVietnameseText(text: string): string {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '') // Remove special characters except Vietnamese
}

/**
 * Generate search variations for Vietnamese text
 */
export function generateVietnameseSearchVariations(text: string): string[] {
  if (!text) return []
  
  const normalized = normalizeVietnameseText(text)
  const withoutDiacritics = removeVietnameseDiacritics(normalized)
  
  const variations = new Set<string>()
  variations.add(normalized)
  variations.add(withoutDiacritics)
  
  // Add common variations
  const words = normalized.split(' ')
  for (const word of words) {
    if (VIETNAMESE_SEARCH_VARIATIONS[word]) {
      VIETNAMESE_SEARCH_VARIATIONS[word].forEach(variation => {
        variations.add(variation)
        variations.add(removeVietnameseDiacritics(variation))
      })
    }
  }
  
  // Add partial matches for compound words
  if (words.length > 1) {
    words.forEach(word => {
      variations.add(word)
      variations.add(removeVietnameseDiacritics(word))
    })
  }
  
  return Array.from(variations).filter(v => v.length > 0)
}

/**
 * Calculate similarity between two Vietnamese strings
 */
export function calculateVietnameseSimilarity(str1: string, str2: string): number {
  const normalize1 = normalizeVietnameseText(str1)
  const normalize2 = normalizeVietnameseText(str2)
  const withoutDiacritics1 = removeVietnameseDiacritics(normalize1)
  const withoutDiacritics2 = removeVietnameseDiacritics(normalize2)
  
  // Exact match
  if (normalize1 === normalize2) return 1.0
  if (withoutDiacritics1 === withoutDiacritics2) return 0.9
  
  // Contains match
  if (normalize1.includes(normalize2) || normalize2.includes(normalize1)) return 0.8
  if (withoutDiacritics1.includes(withoutDiacritics2) || withoutDiacritics2.includes(withoutDiacritics1)) return 0.7
  
  // Word-based similarity
  const words1 = normalize1.split(' ')
  const words2 = normalize2.split(' ')
  const commonWords = words1.filter(word => words2.includes(word))
  const similarity = commonWords.length / Math.max(words1.length, words2.length)
  
  return similarity > 0.5 ? similarity : 0
}

/**
 * Build SQL search conditions for Vietnamese text
 */
export function buildVietnameseSearchConditions(searchTerm: string, fields: string[]): string {
  if (!searchTerm) return ''
  
  const variations = generateVietnameseSearchVariations(searchTerm)
  const conditions: string[] = []
  
  for (const field of fields) {
    for (const variation of variations) {
      if (variation.length > 0) {
        conditions.push(`LOWER(${field}) LIKE '%${variation}%'`)
      }
    }
  }
  
  return conditions.length > 0 ? `(${conditions.join(' OR ')})` : ''
}

/**
 * Highlight search terms in Vietnamese text
 */
export function highlightVietnameseSearchTerms(text: string, searchTerm: string): string {
  if (!text || !searchTerm) return text
  
  const variations = generateVietnameseSearchVariations(searchTerm)
  let highlightedText = text
  
  for (const variation of variations) {
    if (variation.length > 0) {
      const regex = new RegExp(`(${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
    }
  }
  
  return highlightedText
}
