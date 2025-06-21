# 📁 /app/utils/cleaner.py
import re
# from typing import str

def clean_transcript(text: str) -> str:
    """
    Clean transcript text by removing filler words, fixing formatting, etc.
    """
    if not text:
        return ""
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove common filler words and sounds
    filler_patterns = [
        r'\b(um|uh|er|ah|like|you know|so|well|actually|basically|literally)\b',
        r'\[.*?\]',  # Remove bracketed content like [MUSIC] or [LAUGHTER]
        r'\(.*?\)',  # Remove parenthetical content
    ]
    
    for pattern in filler_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    
    # Fix common transcription issues
    text = re.sub(r'\bi\b', 'I', text)  # Fix lowercase 'i'
    text = re.sub(r'(\w)([.!?])(\w)', r'\1\2 \3', text)  # Add space after punctuation
    
    # Remove multiple consecutive punctuation
    text = re.sub(r'[.]{2,}', '.', text)
    text = re.sub(r'[,]{2,}', ',', text)
    
    # Clean up extra spaces
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    return text

def clean_social_media_text(text: str) -> str:
    """
    Clean social media text (tweets, posts) for better processing
    """
    if not text:
        return ""
    
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    
    # Clean up mentions and hashtags for better readability
    text = re.sub(r'@(\w+)', r'@\1', text)  # Keep mentions but ensure proper spacing
    text = re.sub(r'#(\w+)', r'#\1', text)  # Keep hashtags but ensure proper spacing
    
    # Remove excessive emojis (keep some for context)
    text = re.sub(r'([🎉🔥💪✨🚀]{3,})', r'\1'[:2], text)
    
    # Fix thread numbering
    text = re.sub(r'(\d+)/', r'\1/ ', text)
    
    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    return text

def clean_html_content(text: str) -> str:
    """
    Clean HTML content and convert to plain text
    """
    if not text:
        return ""
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Decode HTML entities
    html_entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&nbsp;': ' '
    }
    
    for entity, char in html_entities.items():
        text = text.replace(entity, char)
    
    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    return text

def normalize_text(text: str) -> str:
    """
    General text normalization for better embedding
    """
    if not text:
        return ""
    
    # Convert to lowercase for consistency (optional, depends on use case)
    # text = text.lower()
    
    # Fix common punctuation issues
    text = re.sub(r'([.!?])\1+', r'\1', text)  # Remove repeated punctuation
    text = re.sub(r'([,;:])\1+', r'\1', text)
    
    # Standardize quotes
    text = re.sub(r'[""''`]', '"', text)
    
    # Fix spacing around punctuation
    text = re.sub(r'\s*([.!?])\s*', r'\1 ', text)
    text = re.sub(r'\s*([,;:])\s*', r'\1 ', text)
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    return text

def remove_metadata(text: str) -> str:
    """
    Remove metadata and timestamps from content
    """
    if not text:
        return ""
    
    # Remove timestamps
    timestamp_patterns = [
        r'\[\d{1,2}:\d{2}(?::\d{2})?\]',  # [12:34] or [12:34:56]
        r'\d{1,2}:\d{2}(?::\d{2})?\s*[-–]\s*',  # 12:34 - 
        r'(?:Speaker|SPEAKER)\s*\d*:?\s*',  # Speaker 1: or SPEAKER:
    ]
    
    for pattern in timestamp_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    
    # Remove common metadata markers
    metadata_patterns = [
        r'^\s*Transcript:?\s*',
        r'^\s*Title:?\s*',
        r'^\s*Description:?\s*',
        r'^\s*Tags?:?\s*',
    ]
    
    for pattern in metadata_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.MULTILINE)
    
    # Clean up
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    return text

def extract_key_phrases(text: str) -> list:
    """
    Extract key phrases for better search and analysis
    """
    if not text:
        return []
    
    # Simple extraction based on patterns
    phrases = []
    
    # Extract quoted text
    quotes = re.findall(r'"([^"]+)"', text)
    phrases.extend(quotes)
    
    # Extract emphasized text (basic patterns)
    emphasized = re.findall(r'\*([^*]+)\*', text)
    phrases.extend(emphasized)
    
    # Extract capitalized phrases (likely important)
    caps = re.findall(r'\b[A-Z][A-Z\s]{2,}[A-Z]\b', text)
    phrases.extend(caps)
    
    return list(set(phrases))  # Remove duplicates

def sanitize_for_storage(text: str) -> str:
    """
    Sanitize text for safe database storage
    """
    if not text:
        return ""
    
    # Remove potentially problematic characters
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    
    # Limit length (if needed)
    max_length = 50000  # Adjust based on your storage limits
    if len(text) > max_length:
        text = text[:max_length] + "..."
    
    return text

def clean_content_by_type(content: str, content_type: str) -> str:
    """
    Apply appropriate cleaning based on content type
    """
    if not content:
        return ""
    
    if content_type in ['audio', 'video', 'transcript']:
        return clean_transcript(content)
    elif content_type in ['social', 'twitter', 'thread']:
        return clean_social_media_text(content)
    elif content_type in ['html', 'web', 'url']:
        return clean_html_content(content)
    else:
        return normalize_text(content)