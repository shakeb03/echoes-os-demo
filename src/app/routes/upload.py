# 📁 /app/routes/upload.py
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import tempfile
import os
from typing import Optional
import uuid
from datetime import datetime

from app.services.whisper_basic import transcribe_audio
from app.services.chroma_client import embed_content
from app.utils.cleaner import clean_transcript

router = APIRouter()

class TextUpload(BaseModel):
    type: str
    content: str
    title: str

class URLUpload(BaseModel):
    type: str
    content: str  # URL
    title: str

@router.post("/upload")
async def upload_content(
    file: Optional[UploadFile] = File(None),
    title: Optional[str] = Form(None),
    type: Optional[str] = Form(None),
    content: Optional[str] = Form(None)
):
    """
    Upload and process content (file, URL, or text)
    """
    try:
        content_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        if file:
            # Handle file upload
            return await process_file_upload(file, title, content_id, timestamp)
        elif type == "url":
            # Handle URL upload
            return await process_url_upload(content, title, content_id, timestamp)
        elif type == "text":
            # Handle direct text upload
            return await process_text_upload(content, title, content_id, timestamp)
        else:
            raise HTTPException(status_code=400, detail="No valid input provided")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

async def process_file_upload(file: UploadFile, title: str, content_id: str, timestamp: str):
    """Process uploaded file"""
    
    # Validate file type
    allowed_types = [
        'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac',
        'video/mp4', 'video/quicktime', 'video/x-msvideo',
        'text/plain', 'application/pdf'
    ]
    
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")
    
    # Save file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_path = temp_file.name
    
    try:
        if file.content_type.startswith('audio/') or file.content_type.startswith('video/'):
            # Transcribe audio/video
            transcript = await transcribe_audio(temp_path)
            cleaned_content = clean_transcript(transcript)
            
            # Embed in vector DB
            embedding_result = await embed_content(
                content=cleaned_content,
                title=title or file.filename,
                source=file.filename,
                content_type="audio/video",
                content_id=content_id,
                timestamp=timestamp
            )
            
            return {
                "success": True,
                "content_id": content_id,
                "type": "audio/video",
                "title": title or file.filename,
                "transcript_length": len(cleaned_content),
                "embedding_id": embedding_result.get("id"),
                "message": "Audio/video transcribed and embedded successfully"
            }
            
        elif file.content_type == 'text/plain':
            # Process text file
            text_content = content.decode('utf-8')
            cleaned_content = clean_transcript(text_content)
            
            embedding_result = await embed_content(
                content=cleaned_content,
                title=title or file.filename,
                source=file.filename,
                content_type="text",
                content_id=content_id,
                timestamp=timestamp
            )
            
            return {
                "success": True,
                "content_id": content_id,
                "type": "text",
                "title": title or file.filename,
                "content_length": len(cleaned_content),
                "embedding_id": embedding_result.get("id"),
                "message": "Text file processed and embedded successfully"
            }
            
        else:
            # PDF or other document types
            # For demo, treat as text (in production, use proper PDF extraction)
            text_content = f"Document: {file.filename}\nContent processing not fully implemented for {file.content_type}"
            
            embedding_result = await embed_content(
                content=text_content,
                title=title or file.filename,
                source=file.filename,
                content_type="document",
                content_id=content_id,
                timestamp=timestamp
            )
            
            return {
                "success": True,
                "content_id": content_id,
                "type": "document",
                "title": title or file.filename,
                "embedding_id": embedding_result.get("id"),
                "message": "Document uploaded (basic processing)"
            }
            
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.unlink(temp_path)

async def process_url_upload(url: str, title: str, content_id: str, timestamp: str):
    """Process URL content"""
    
    # Basic URL validation
    if not url.startswith(('http://', 'https://')):
        raise HTTPException(status_code=400, detail="Invalid URL format")
    
    # For demo purposes, create placeholder content
    # In production, implement actual URL scraping/downloading
    placeholder_content = f"URL Content: {url}\nTitle: {title}\nThis is a placeholder for URL content extraction."
    
    embedding_result = await embed_content(
        content=placeholder_content,
        title=title,
        source=url,
        content_type="url",
        content_id=content_id,
        timestamp=timestamp
    )
    
    return {
        "success": True,
        "content_id": content_id,
        "type": "url",
        "title": title,
        "source": url,
        "embedding_id": embedding_result.get("id"),
        "message": "URL content processed (demo mode)"
    }

async def process_text_upload(text_content: str, title: str, content_id: str, timestamp: str):
    """Process direct text input"""
    
    if not text_content.strip():
        raise HTTPException(status_code=400, detail="Text content cannot be empty")
    
    cleaned_content = clean_transcript(text_content)
    
    embedding_result = await embed_content(
        content=cleaned_content,
        title=title,
        source="direct_input",
        content_type="text",
        content_id=content_id,
        timestamp=timestamp
    )
    
    return {
        "success": True,
        "content_id": content_id,
        "type": "text",
        "title": title,
        "content_length": len(cleaned_content),
        "embedding_id": embedding_result.get("id"),
        "message": "Text content processed and embedded successfully"
    }

@router.post("/upload/text")
async def upload_text(data: TextUpload):
    """Direct text upload endpoint"""
    content_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()
    
    return await process_text_upload(data.content, data.title, content_id, timestamp)

@router.post("/upload/url")
async def upload_url(data: URLUpload):
    """Direct URL upload endpoint"""
    content_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()
    
    return await process_url_upload(data.content, data.title, content_id, timestamp)