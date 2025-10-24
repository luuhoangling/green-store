import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { generateVietnameseSearchVariations, calculateVietnameseSimilarity } from '@/lib/vietnamese-utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    const searchTerm = query.trim()
    const variations = generateVietnameseSearchVariations(searchTerm)

    // Get product suggestions
    const productSuggestions = await sql`
      SELECT DISTINCT 
        p.name,
        p.slug,
        p.brand,
        c.name as category_name,
        'product' as type
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      AND (
        ${variations.map(variation => 
          sql`LOWER(p.name) LIKE ${`%${variation}%`}`
        ).reduce((acc, curr) => sql`${acc} OR ${curr}`)}
      )
      ORDER BY p.name
      LIMIT ${limit}
    `

    // Get category suggestions
    const categorySuggestions = await sql`
      SELECT DISTINCT 
        name,
        slug,
        NULL as brand,
        name as category_name,
        'category' as type
      FROM categories
      WHERE (
        ${variations.map(variation => 
          sql`LOWER(name) LIKE ${`%${variation}%`}`
        ).reduce((acc, curr) => sql`${acc} OR ${curr}`)}
      )
      ORDER BY name
      LIMIT 5
    `

    // Get brand suggestions (only search by brand name)
    const brandSuggestions = await sql`
      SELECT DISTINCT 
        brand as name,
        NULL as slug,
        brand,
        NULL as category_name,
        'brand' as type
      FROM products
      WHERE is_active = true 
      AND brand IS NOT NULL
      AND (
        ${variations.map(variation => 
          sql`LOWER(brand) LIKE ${`%${variation}%`}`
        ).reduce((acc, curr) => sql`${acc} OR ${curr}`)}
      )
      ORDER BY brand
      LIMIT 5
    `

    // Combine and sort suggestions by relevance
    const allSuggestions = [
      ...productSuggestions,
      ...categorySuggestions,
      ...brandSuggestions
    ]

    // Calculate relevance scores based only on name field
    const scoredSuggestions = allSuggestions.map(suggestion => {
      const name = suggestion.name || ''
      
      // Only calculate similarity based on name field
      const relevanceScore = calculateVietnameseSimilarity(searchTerm, name)
      
      return {
        ...suggestion,
        relevanceScore
      }
    })

    // Sort by relevance and remove duplicates
    const uniqueSuggestions = scoredSuggestions
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.name === suggestion.name && s.type === suggestion.type)
      )
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: uniqueSuggestions
    })

  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch search suggestions'
    }, { status: 500 })
  }
}
