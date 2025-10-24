import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL
    const hasDbUrl = !!dbUrl
    
    return NextResponse.json({
      success: true,
      hasDatabaseUrl: hasDbUrl,
      databaseUrlLength: dbUrl?.length || 0,
      databaseUrlStart: dbUrl?.substring(0, 20) || 'N/A',
      nodeEnv: process.env.NODE_ENV,
      message: 'Debug info'
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
