# 📁 /app/routes/upload.py
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import tempfile
import os
import re
import logging
from typing import Optional
import uuid
from datetime import datetime

from app.services.whisper_basic import transcribe_audio
from app.services.chroma_client import embed_content
from app.services.youtube_processor import download_and_transcribe_youtube, is_youtube_url, youtube_demo_fallback
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
    """Process URL content with actual fetching and transcription"""
    
    # Basic URL validation
    if not url.startswith(('http://', 'https://')):
        raise HTTPException(status_code=400, detail="Invalid URL format")
    
    try:
        # Check if it's a YouTube URL
        if is_youtube_url(url):
            return await process_youtube_video(url, title, content_id, timestamp)
        
        # Check if it's a direct media URL
        elif is_media_url(url):
            return await process_media_url(url, title, content_id, timestamp)
        
        # Try to scrape web content
        else:
            return await process_web_content(url, title, content_id, timestamp)
            
    except Exception as e:
        logging.error(f"URL processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process URL: {str(e)}")

# Helper functions moved to youtube_processor.py

async def process_youtube_video(url: str, title: str, content_id: str, timestamp: str):
    """Process YouTube video by downloading and transcribing"""
    
    try:
        # Try to use the real YouTube processor
        try:
            result = await download_and_transcribe_youtube(url, title)
        except ImportError:
            # Fallback to demo mode if yt-dlp is not available
            logging.warning("yt-dlp not available, using demo mode")
            result = await youtube_demo_fallback(url, title)
        
        if not result.get("success"):
            raise Exception(result.get("error", "YouTube processing failed"))
        
        transcript = result["transcript"]
        video_title = result["title"]
        
        # Embed in vector DB
        embedding_result = await embed_content(
            content=transcript,
            title=video_title,
            source=url,
            content_type="youtube_video",
            content_id=content_id,
            timestamp=timestamp
        )
        
        return {
            "success": True,
            "content_id": content_id,
            "type": "youtube_video",
            "title": video_title,
            "source": url,
            "duration": result.get("duration", 0),
            "uploader": result.get("uploader", "Unknown"),
            "transcript_length": len(transcript),
            "embedding_id": embedding_result.get("id"),
            "message": f"YouTube video '{video_title}' transcribed and processed successfully" + (" (demo mode)" if result.get("demo_mode") else "")
        }
        
    except Exception as e:
        raise Exception(f"YouTube processing failed: {str(e)}")

async def process_media_url(url: str, title: str, content_id: str, timestamp: str):
    """Process direct media URL by downloading and transcribing"""
    import tempfile
    import requests
    
    try:
        # Download the media file
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            for chunk in response.iter_content(chunk_size=8192):
                temp_file.write(chunk)
            temp_path = temp_file.name
        
        try:
            # Transcribe the audio
            transcript = await transcribe_audio(temp_path)
            cleaned_content = clean_transcript(transcript)
            
            # Embed in vector DB
            embedding_result = await embed_content(
                content=cleaned_content,
                title=title,
                source=url,
                content_type="media_url",
                content_id=content_id,
                timestamp=timestamp
            )
            
            return {
                "success": True,
                "content_id": content_id,
                "type": "media_url",
                "title": title,
                "source": url,
                "transcript_length": len(cleaned_content),
                "embedding_id": embedding_result.get("id"),
                "message": "Media file downloaded and transcribed successfully"
            }
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        raise Exception(f"Media URL processing failed: {str(e)}")

async def process_web_content(url: str, title: str, content_id: str, timestamp: str):
    """Process web page content by scraping text"""
    import requests
    from bs4 import BeautifulSoup
    
    try:
        # Fetch the web page
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Parse HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Extract text content
        text_content = soup.get_text()
        
        # Clean and process the content
        from app.utils.cleaner import clean_html_content
        cleaned_content = clean_html_content(text_content)
        
        # Limit content length
        if len(cleaned_content) > 50000:
            cleaned_content = cleaned_content[:50000] + "..."
        
        if not cleaned_content.strip():
            raise Exception("No meaningful content found on the web page")
        
        # Embed in vector DB
        embedding_result = await embed_content(
            content=cleaned_content,
            title=title,
            source=url,
            content_type="web_content",
            content_id=content_id,
            timestamp=timestamp
        )
        
        return {
            "success": True,
            "content_id": content_id,
            "type": "web_content",
            "title": title,
            "source": url,
            "content_length": len(cleaned_content),
            "embedding_id": embedding_result.get("id"),
            "message": "Web content scraped and processed successfully"
        }
        
    except Exception as e:
        raise Exception(f"Web content processing failed: {str(e)}")

def is_media_url(url: str) -> bool:
    """Check if URL points to a media file"""
    media_extensions = ['.mp4', '.mp3', '.wav', '.m4a', '.avi', '.mov', '.mkv']
    return any(url.lower().endswith(ext) for ext in media_extensions)

def extract_youtube_id(url: str) -> str:
    """Extract YouTube video ID from various URL formats"""
    patterns = [
        r'youtube\.com/watch\?v=([^&]+)',
        r'youtu\.be/([^?]+)',
        r'youtube\.com/embed/([^?]+)',
        r'youtube\.com/v/([^?]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return ""

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