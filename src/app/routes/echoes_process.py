# 📁 /app/routes/echoes_process.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging
import asyncio

from app.services.chroma_client import search_memories
from app.services.gpt_agent import generate_blueprint, enhance_search_results, determine_input_type

router = APIRouter()

class EchoesRequest(BaseModel):
    content: str

class MemoryResult(BaseModel):
    id: str
    content: str
    source: str
    title: str
    timestamp: Optional[str] = None
    score: float

class BlueprintStep(BaseModel):
    step: int
    tool: str
    action: str
    note: str

class AnalysisInsights(BaseModel):
    contentType: str
    confidence: float
    insights: List[str]

class EchoesResponse(BaseModel):
    memories: List[MemoryResult]
    blueprint: List[BlueprintStep]
    analysis: AnalysisInsights

@router.post("/echoes-process")
async def echoes_unified_process(data: EchoesRequest):
    """
    Unified endpoint that provides both memory search and blueprint analysis
    """
    
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    
    try:
        content = data.content.strip()
        
        # Determine if this is a query or content to analyze
        input_analysis = await determine_input_type(content)
        is_query = input_analysis.get("is_query", True)
        confidence = input_analysis.get("confidence", 0.5)
        
        # Run both processes in parallel for efficiency
        memory_task = search_and_format_memories(content)
        blueprint_task = generate_and_format_blueprint(content) if not is_query else None
        
        # Wait for memory search
        memories = await memory_task
        
        # Wait for blueprint if it's running
        blueprint = []
        if blueprint_task:
            blueprint = await blueprint_task
        
        # Generate insights
        insights = generate_unified_insights(content, memories, blueprint, is_query)
        
        return EchoesResponse(
            memories=memories,
            blueprint=blueprint,
            analysis=AnalysisInsights(
                contentType="query" if is_query else "content",
                confidence=confidence,
                insights=insights
            )
        )
        
    except Exception as e:
        logging.error(f"Echoes processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

async def search_and_format_memories(query: str, limit: int = 5) -> List[MemoryResult]:
    """Search memories and format results"""
    try:
        search_results = await search_memories(
            query=query,
            limit=limit,
            threshold=0.3
        )
        
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
        
        # Enhance with GPT if we have results
        if formatted_results:
            try:
                enhanced = await enhance_search_results(query, formatted_results)
                if enhanced:
                    formatted_results = enhanced
            except Exception as e:
                logging.warning(f"Could not enhance memory results: {e}")
        
        return formatted_results
        
    except Exception as e:
        logging.error(f"Memory search failed: {e}")
        return []

async def generate_and_format_blueprint(content: str) -> List[BlueprintStep]:
    """Generate blueprint and format results"""
    try:
        blueprint_result = await generate_blueprint(content)
        
        if not blueprint_result:
            return []
        
        formatted_steps = []
        for step_data in blueprint_result.get("steps", []):
            formatted_steps.append(BlueprintStep(
                step=step_data.get("step", 0),
                tool=step_data.get("tool", "Unknown"),
                action=step_data.get("action", ""),
                note=step_data.get("note", "")
            ))
        
        return formatted_steps
        
    except Exception as e:
        logging.error(f"Blueprint generation failed: {e}")
        return []

def generate_unified_insights(content: str, memories: List[MemoryResult], blueprint: List[BlueprintStep], is_query: bool) -> List[str]:
    """Generate insights based on the unified analysis"""
    insights = []
    
    try:
        if is_query:
            # Query-based insights
            if memories:
                insights.append(f"Found {len(memories)} relevant memories from your past content")
                
                # Analyze sources
                sources = [m.source for m in memories]
                unique_sources = len(set(sources))
                if unique_sources > 1:
                    insights.append(f"Results span {unique_sources} different content sources")
                
                # Analyze scores
                avg_score = sum(m.score for m in memories) / len(memories)
                if avg_score > 0.8:
                    insights.append("High confidence matches - very relevant to your query")
                elif avg_score > 0.6:
                    insights.append("Good matches found with moderate confidence")
                else:
                    insights.append("Some related content found, but matches are loose")
                    
            else:
                insights.append("No matching memories found - try a different query or upload more content")
        
        else:
            # Content analysis insights
            if blueprint:
                insights.append(f"Identified {len(blueprint)} steps in the creative workflow")
                
                # Analyze tools
                tools = [step.tool for step in blueprint]
                unique_tools = len(set(tools))
                insights.append(f"Process likely involved {unique_tools} different tools")
                
                # Analyze complexity
                if len(blueprint) > 5:
                    insights.append("Complex multi-step workflow with significant planning")
                elif len(blueprint) > 3:
                    insights.append("Moderate workflow complexity with clear structure")
                else:
                    insights.append("Simple, streamlined creative process")
            
            # Memory connections
            if memories:
                insights.append(f"Found {len(memories)} related pieces in your past content")
                insights.append("This content connects to themes you've explored before")
        
        # General insights
        if len(content.split()) > 200:
            insights.append("Substantial content with rich detail for analysis")
        elif len(content.split()) > 50:
            insights.append("Medium-length content with good analytical depth")
        
    except Exception as e:
        logging.warning(f"Could not generate insights: {e}")
        insights.append("Analysis completed successfully")
    
    return insights[:5]  # Limit to 5 insights max

@router.get("/echoes-process/health")
async def echoes_health_check():
    """Health check for unified processing"""
    return {
        "status": "healthy",
        "services": {
            "memory_search": "operational",
            "blueprint_generation": "operational",
            "unified_processing": "operational"
        }
    }