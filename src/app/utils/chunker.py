# 📁 /app/utils/chunker.py
import re
from typing import List

def chunk_text(text: str, max_tokens: int = 800, overlap_tokens: int = 100) -> List[str]:
    """
    Chunk text into overlapping segments for better embedding
    """
    if not text.strip():
        return []
    
    # Rough estimate: 1 token ≈ 4 characters for English text
    max_chars = max_tokens * 4
    overlap_chars = overlap_tokens * 4
    
    # Split by paragraphs first
    paragraphs = text.split('\n\n')
    
    chunks = []
    current_chunk = ""
    
    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue
        
        # If adding this paragraph would exceed max_chars
        if len(current_chunk + paragraph) > max_chars:
            if current_chunk:
                chunks.append(current_chunk.strip())
                # Start new chunk with overlap from previous chunk
                current_chunk = get_overlap_text(current_chunk, overlap_chars) + paragraph
            else:
                # Paragraph itself is too long, split it by sentences
                sentence_chunks = chunk_by_sentences(paragraph, max_chars, overlap_chars)
                chunks.extend(sentence_chunks)
                current_chunk = ""
        else:
            if current_chunk:
                current_chunk += "\n\n" + paragraph
            else:
                current_chunk = paragraph
    
    # Add the last chunk
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

def chunk_by_sentences(text: str, max_chars: int, overlap_chars: int) -> List[str]:
    """
    Chunk long text by sentences when paragraphs are too long
    """
    sentences = re.split(r'[.!?]+', text)
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        
        if len(current_chunk + sentence) > max_chars:
            if current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = get_overlap_text(current_chunk, overlap_chars) + sentence
            else:
                # Single sentence is too long, split by words
                word_chunks = chunk_by_words(sentence, max_chars, overlap_chars)
                chunks.extend(word_chunks)
                current_chunk = ""
        else:
            if current_chunk:
                current_chunk += ". " + sentence
            else:
                current_chunk = sentence
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

def chunk_by_words(text: str, max_chars: int, overlap_chars: int) -> List[str]:
    """
    Chunk by words when sentences are too long
    """
    words = text.split()
    chunks = []
    current_chunk = ""
    
    for word in words:
        if len(current_chunk + " " + word) > max_chars:
            if current_chunk:
                chunks.append(current_chunk.strip())
                # Get overlap words
                overlap_words = get_overlap_words(current_chunk, overlap_chars)
                current_chunk = overlap_words + " " + word if overlap_words else word
            else:
                # Single word is too long (rare case)
                chunks.append(word)
                current_chunk = ""
        else:
            if current_chunk:
                current_chunk += " " + word
            else:
                current_chunk = word
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

def get_overlap_text(text: str, overlap_chars: int) -> str:
    """
    Get overlap text from the end of a chunk
    """
    if len(text) <= overlap_chars:
        return text
    
    # Try to find a good break point (sentence or paragraph end)
    overlap_text = text[-overlap_chars:]
    
    # Look for sentence boundaries
    sentence_end = max(
        overlap_text.rfind('.'),
        overlap_text.rfind('!'),
        overlap_text.rfind('?')
    )
    
    if sentence_end > overlap_chars // 2:  # If we found a good break point
        return overlap_text[sentence_end + 1:].strip()
    
    # Otherwise, just use the last part
    return overlap_text.strip()

def get_overlap_words(text: str, overlap_chars: int) -> str:
    """
    Get overlap words from the end of a chunk
    """
    if len(text) <= overlap_chars:
        return text
    
    words = text.split()
    overlap_text = ""
    
    # Add words from the end until we reach overlap_chars
    for i in range(len(words) - 1, -1, -1):
        if len(overlap_text + " " + words[i]) > overlap_chars:
            break
        if overlap_text:
            overlap_text = words[i] + " " + overlap_text
        else:
            overlap_text = words[i]
    
    return overlap_text

def smart_chunk_transcript(transcript: str, max_tokens: int = 600) -> List[str]:
    """
    Specialized chunking for transcripts with speaker awareness
    """
    # Look for speaker patterns (e.g., "Speaker 1:", timestamps)
    speaker_pattern = r'(Speaker \d+:|SPEAKER_\d+:|\[\d{2}:\d{2}\])'
    
    if re.search(speaker_pattern, transcript):
        # Split by speaker changes
        segments = re.split(speaker_pattern, transcript)
        chunks = []
        current_chunk = ""
        max_chars = max_tokens * 4
        
        for segment in segments:
            segment = segment.strip()
            if not segment:
                continue
            
            if len(current_chunk + segment) > max_chars:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = segment
            else:
                current_chunk += " " + segment if current_chunk else segment
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    else:
        # Use regular chunking
        return chunk_text(transcript, max_tokens)

def estimate_tokens(text: str) -> int:
    """
    Rough estimation of token count
    """
    # Simple heuristic: ~4 characters per token for English
    return len(text) // 4

def validate_chunks(chunks: List[str], max_tokens: int) -> bool:
    """
    Validate that all chunks are within token limits
    """
    for chunk in chunks:
        if estimate_tokens(chunk) > max_tokens:
            return False
    return True