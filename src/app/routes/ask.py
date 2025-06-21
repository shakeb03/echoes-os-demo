# 📁 /app/routes/ask.py
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.services.chroma_client import search_memories
from app.services.gpt_agent import enhance_search_results

router = APIRouter()

class SearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 5
    threshold: Optional[float] = 0.3

class MemoryResult(BaseModel):
    id: str
    content: str
    source: str
    title: str
    timestamp: Optional[str] = None
    score: float

class SearchResponse(BaseModel):
    query: str
    results: List[MemoryResult]
    total_found: int
    search_time_ms: int

@router.get("/ask")
async def ask_memory(
    query: str = Query(..., description="Search query for your past content"),
    limit: int = Query(5, description="Maximum number of results to return"),
    threshold: float = Query(0.3, description="Minimum similarity threshold")
):
    """
    Search your memory with natural language queries
    """
    
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    try:
        import time
        start_time = time.time()
        
        # Search vector database
        search_results = await search_memories(
            query=query.strip(),
            limit=limit,
            threshold=threshold
        )
        
        # Format results
        formatted_results = []
        for result in search_results:
            formatted_results.append(MemoryResult(
                id=result.get("id", ""),
                content=result.get("content", ""),
                source=result.get("source", ""),
                title=result.get("title", ""),
                timestamp=result.get("timestamp"),
                score=result.get("score", 0.0)
            ))
        
        search_time = int((time.time() - start_time) * 1000)
        
        # Enhance results with GPT if we have matches
        if formatted_results:
            try:
                enhanced_results = await enhance_search_results(query, formatted_results)
                if enhanced_results:
                    formatted_results = enhanced_results
            except Exception as e:
                logging.warning(f"Could not enhance results with GPT: {e}")
        
        return SearchResponse(
            query=query,
            results=formatted_results,
            total_found=len(formatted_results),
            search_time_ms=search_time
        )
        
    except Exception as e:
        logging.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/ask")
async def ask_memory_post(data: SearchQuery):
    """
    POST version of memory search
    """
    return await ask_memory(
        query=data.query,
        limit=data.limit,
        threshold=data.threshold
    )

@router.get("/ask/suggestions")
async def get_search_suggestions():
    """
    Get suggested search queries based on available content
    """
    try:
        # For demo, return static suggestions
        # In production, generate based on actual content
        suggestions = [
            "When did I talk about burnout?",
            "What metaphors did I use for motivation?",
            "Show me content about productivity",
            "What did I say about remote work?",
            "Find my thoughts on AI and creativity",
            "How did I describe work-life balance?",
            "What advice did I give about startups?",
            "Show me my best performing content",
            "What topics do I cover most often?",
            "Find content from last month"
        ]
        
        return {
            "suggestions": suggestions,
            "categories": [
                {"name": "Topics", "queries": suggestions[:5]},
                {"name": "Themes", "queries": suggestions[5:]}
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get suggestions: {str(e)}")

@router.get("/ask/stats")
async def get_memory_stats():
    """
    Get statistics about stored memories
    """
    try:
        # For demo purposes, return mock stats
        # In production, query actual ChromaDB statistics
        stats = {
            "total_memories": 147,
            "content_types": {
                "audio/video": 23,
                "text": 89,
                "url": 35
            },
            "average_length": 892,
            "date_range": {
                "earliest": "2023-01-15",
                "latest": "2024-12-20"
            },
            "top_sources": [
                {"name": "Blog Posts", "count": 45},
                {"name": "Podcast Episodes", "count": 23},
                {"name": "Tweet Threads", "count": 38},
                {"name": "Video Content", "count": 18}
            ]
        }
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")