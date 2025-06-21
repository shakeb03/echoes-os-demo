# 📁 /app/services/whisper_basic.py
import openai
import os
from typing import Optional
import logging

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

async def transcribe_audio(file_path: str) -> str:
    """
    Basic audio transcription using OpenAI Whisper API
    For production: use private repo's advanced pipeline with chunking, diarization, etc.
    """
    try:
        with open(file_path, "rb") as audio_file:
            transcript = openai.Audio.transcribe(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
        
        return transcript
        
    except Exception as e:
        logging.error(f"Transcription failed: {e}")
        # Fallback for demo
        return f"[Transcription failed - demo mode] Audio file: {os.path.basename(file_path)}"

async def transcribe_with_timestamps(file_path: str) -> dict:
    """
    Transcribe with timestamp information
    Returns both text and structured data
    """
    try:
        with open(file_path, "rb") as audio_file:
            transcript = openai.Audio.transcribe(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",
                timestamp_granularities=["word"]
            )
        
        return {
            "text": transcript.text,
            "language": transcript.language,
            "duration": transcript.duration,
            "words": transcript.words if hasattr(transcript, 'words') else [],
            "segments": transcript.segments if hasattr(transcript, 'segments') else []
        }
        
    except Exception as e:
        logging.error(f"Detailed transcription failed: {e}")
        # Fallback
        basic_transcript = await transcribe_audio(file_path)
        return {
            "text": basic_transcript,
            "language": "en",
            "duration": 0,
            "words": [],
            "segments": []
        }

def estimate_transcription_time(file_size_mb: float) -> int:
    """
    Estimate transcription time in seconds based on file size
    """
    # Rough estimate: 1MB ≈ 1 minute of audio ≈ 10 seconds processing
    return max(10, int(file_size_mb * 10))

def validate_audio_file(file_path: str) -> bool:
    """
    Basic validation of audio file
    """
    try:
        import mimetypes
        mime_type, _ = mimetypes.guess_type(file_path)
        
        supported_types = [
            'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac',
            'video/mp4', 'video/quicktime', 'video/x-msvideo'
        ]
        
        return mime_type in supported_types
        
    except Exception:
        return False

# Placeholder functions for private repo integration
def advanced_transcribe(file_path: str, options: dict = None):
    """
    Placeholder for advanced transcription from private repo
    Would include: chunking, silence trimming, speaker diarization, etc.
    """
    pass

def optimize_audio_for_transcription(file_path: str):
    """
    Placeholder for audio optimization pipeline
    Would include: noise reduction, normalization, format conversion
    """
    pass