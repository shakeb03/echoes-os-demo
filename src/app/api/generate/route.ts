// 📁 /app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'


const FASTAPI_BASE_URL = process.env.FASTAPI_URL || 'http://localhost:8000/api'


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt } = body

    console.log('FASTAPI_BASE_URL:', FASTAPI_BASE_URL)

    const response = await fetch(`${FASTAPI_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
