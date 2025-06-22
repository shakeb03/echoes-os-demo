# 📁 /app/services/youtube_processor.py
import yt_dlp
import tempfile
import os
import logging
from typing import Dict, Any, Optional

from app.services.whisper_basic import transcribe_audio
from app.utils.cleaner import clean_transcript

async def download_and_transcribe_youtube(url: str, title: str) -> Dict[str, Any]:
    """
    Download YouTube video audio and transcribe it
    """
    temp_audio_path = None
    
    try:
        # Configure yt-dlp options
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': tempfile.mktemp(suffix='.%(ext)s'),
            'extractaudio': True,
            'audioformat': 'mp3',
            'audioquality': '192K',
            'no_warnings': True,
            'quiet': True,
        }
        
        # Download the audio
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Extract info first
            info = ydl.extract_info(url, download=False)
            video_title = info.get('title', title)
            duration = info.get('duration', 0)
            uploader = info.get('uploader', 'Unknown')
            
            # Check duration (limit to reasonable length for demo)
            if duration and duration > 3600:  # 1 hour limit
                raise Exception("Video is too long (over 1 hour). Please try a shorter video.")
            
            # Download the audio
            temp_audio_path = tempfile.mktemp(suffix='.mp3')
            ydl_opts['outtmpl'] = temp_audio_path.replace('.mp3', '.%(ext)s')
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl_download:
                ydl_download.download([url])
        
        # Find the downloaded file (yt-dlp might change the extension)
        base_path = temp_audio_path.replace('.mp3', '')
        possible_extensions = ['.mp3', '.m4a', '.webm', '.wav']
        actual_path = None
        
        for ext in possible_extensions:
            test_path = base_path + ext
            if os.path.exists(test_path):
                actual_path = test_path
                break
        
        if not actual_path:
            raise Exception("Downloaded audio file not found")
        
        # Transcribe the audio
        transcript = await transcribe_audio(actual_path)
        cleaned_transcript = clean_transcript(transcript)
        
        return {
            "transcript": cleaned_transcript,
            "title": video_title,
            "duration": duration,
            "uploader": uploader,
            "original_url": url,
            "success": True
        }
        
    except Exception as e:
        logging.error(f"YouTube processing failed: {e}")
        return {
            "error": str(e),
            "success": False
        }
        
    finally:
        # Clean up temporary files
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.unlink(temp_audio_path)
            except:
                pass
        
        # Also clean up the base path with different extensions
        if temp_audio_path:
            base_path = temp_audio_path.replace('.mp3', '')
            for ext in ['.mp3', '.m4a', '.webm', '.wav']:
                try:
                    test_path = base_path + ext
                    if os.path.exists(test_path):
                        os.unlink(test_path)
                except:
                    pass

async def get_youtube_info(url: str) -> Dict[str, Any]:
    """
    Get YouTube video information without downloading
    """
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'cookiefile': '/home/ubuntu/cookies.txt'
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            return {
                "title": info.get('title', 'Unknown Title'),
                "duration": info.get('duration', 0),
                "uploader": info.get('uploader', 'Unknown'),
                "description": info.get('description', ''),
                "view_count": info.get('view_count', 0),
                "upload_date": info.get('upload_date', ''),
                "success": True
            }
            
    except Exception as e:
        logging.error(f"Failed to get YouTube info: {e}")
        return {
            "error": str(e),
            "success": False
        }

def is_youtube_url(url: str) -> bool:
    """Check if URL is a YouTube video"""
    youtube_patterns = [
        r'youtube\.com/watch\?v=',
        r'youtu\.be/',
        r'youtube\.com/embed/',
        r'youtube\.com/v/',
        r'youtube\.com/shorts/',
    ]
    return any(__import__('re').search(pattern, url) for pattern in youtube_patterns)

def extract_youtube_id(url: str) -> str:
    """Extract YouTube video ID from various URL formats"""
    import re
    
    patterns = [
        r'youtube\.com/watch\?v=([^&]+)',
        r'youtu\.be/([^?]+)',
        r'youtube\.com/embed/([^?]+)',
        r'youtube\.com/v/([^?]+)',
        r'youtube\.com/shorts/([^?]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return ""

# For demo/development when yt-dlp is not available
async def youtube_demo_fallback(url: str, title: str) -> Dict[str, Any]:
    """
    Fallback for when yt-dlp is not available - creates meaningful demo content
    """
    video_id = extract_youtube_id(url)
    
    demo_transcript = f"""
    YouTube Video: {title}
    Video URL: {url}
    Video ID: {video_id}
    
    [Demo Mode - This would be the actual transcript in production]
    
    This is a demonstration of how Echoes OS would process YouTube videos. In a real deployment:
    
    1. The video audio would be downloaded using yt-dlp
    2. The audio would be transcribed using OpenAI Whisper
    3. The transcript would be cleaned and processed
    4. Timestamps and speaker identification would be preserved
    5. The content would be chunked and embedded for semantic search
    
    Key features that would be extracted:
    - Main topics and themes discussed
    - Important quotes and insights
    - Technical concepts explained
    - Actionable advice given
    - References to other content or creators
    
    This allows you to search your video content with natural language queries like:
    "What did they say about productivity?"
    "When did they mention the framework?"
    "What advice was given for beginners?"
    """
    
    return {
        "transcript": demo_transcript,
        "title": title,
        "duration": 0,
        "uploader": "Demo Mode",
        "original_url": url,
        "success": True,
        "demo_mode": True
    }