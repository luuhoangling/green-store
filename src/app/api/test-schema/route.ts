import { sql } from '@/lib/neon'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check current schema
    const schemaCheck = await sql`SELECT current_schema() AS schema, current_database() AS db`
    
    // List all tables in nongsanviet schema
    const tables = await sql`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('nongsanviet', 'public')
      ORDER BY table_schema, table_name
    `
    
    // Try to count products
    let productCount = null
    try {
      const count = await sql`SELECT COUNT(*) as count FROM products`
      productCount = count[0]
    } catch (e: any) {
      productCount = { error: e.message }
    }

    return NextResponse.json({
      schema: schemaCheck[0],
      tables,
      productCount
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      detail: error
    }, { status: 500 })
  }
}
