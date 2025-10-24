import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    // Get parent categories (where parent_id is NULL)
    const parentCategories = await sql`
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      WHERE c.parent_id IS NULL
      GROUP BY c.id
      ORDER BY c.name ASC
    `

    // Get children for each parent category
    const categoriesWithChildren = await Promise.all(
      parentCategories.map(async (category) => {
        const children = await sql`
          SELECT 
            c.*,
            COUNT(p.id) as product_count
          FROM categories c
          LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
          WHERE c.parent_id = ${category.id}
          GROUP BY c.id
          ORDER BY c.name ASC
        `
        
        // Calculate total products including children
        const childrenProductCount = children.reduce((sum, child) => 
          sum + parseInt(child.product_count || '0'), 0
        )
        
        return {
          ...category,
          children: children.map(child => ({
            ...child,
            _count: {
              products: parseInt(child.product_count || '0')
            }
          })),
          _count: {
            products: parseInt(category.product_count || '0') + childrenProductCount
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: categoriesWithChildren
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch categories' 
      },
      { status: 500 }
    )
  }
}
