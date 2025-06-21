// 📁 /app/api/ask/route.ts
import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_BASE_URL = process.env.FASTAPI_URL || 'http://localhost:8000/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const limit = searchParams.get('limit') || '5'
    const threshold = searchParams.get('threshold') || '0.3'
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }
    
    const params = new URLSearchParams({
      query,
      limit,
      threshold,
    })
    
    const response = await fetch(`${FASTAPI_BASE_URL}/ask?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`FastAPI error: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Ask API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Memory search failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        results: [],
        total_found: 0,
        search_time_ms: 0
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${FASTAPI_BASE_URL}/ask`, {
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
    console.error('Ask POST API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Memory search failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        results: [],
        total_found: 0,
        search_time_ms: 0
      },
      { status: 500 }
    )
  }
}