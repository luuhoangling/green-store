// Database connection using Neon
import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL!)

// Test connection function
export async function testConnection() {
  try {
    const rows = await sql`SELECT now() AS now, current_database() AS db, current_schema() AS schema`
    return rows
  } catch (error) {
    console.error('Database connection failed:', error)
    throw error
  }
}
