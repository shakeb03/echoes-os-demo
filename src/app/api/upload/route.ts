// 📁 /app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_BASE_URL = process.env.FASTAPI_URL || 'http://localhost:8000/api'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData()
      
      // Forward the FormData to FastAPI
      const response = await fetch(`${FASTAPI_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type - let fetch handle it for FormData
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`FastAPI error: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      return NextResponse.json(result)
      
    } else {
      // Handle JSON upload (text or URL)
      const body = await request.json()
      
      let endpoint = '/upload'
      if (body.type === 'text') {
        endpoint = '/upload/text'
      } else if (body.type === 'url') {
        endpoint = '/upload/url'
      }
      
      const response = await fetch(`${FASTAPI_BASE_URL}${endpoint}`, {
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
    }
    
  } catch (error) {
    console.error('Upload API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Upload endpoint - use POST to upload content' },
    { status: 200 }
  )
}