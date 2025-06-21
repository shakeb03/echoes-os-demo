// 📁 /app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_BASE_URL = process.env.FASTAPI_URL || 'http://localhost:8000/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { error: 'Content is required for analysis' },
        { status: 400 }
      )
    }
    
    const response = await fetch(`${FASTAPI_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`FastAPI error: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Analyze API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Content analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        blueprint: [],
        content_type: 'unknown',
        confidence: 0.0,
        insights: []
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Analyze endpoint - use POST to analyze content' },
    { status: 200 }
  )
}