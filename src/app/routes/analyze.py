# 📁 /app/routes/analyze.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.services.gpt_agent import generate_blueprint

router = APIRouter()

class AnalyzeRequest(BaseModel):
    content: str

class BlueprintStep(BaseModel):
    step: int
    tool: str
    action: str
    note: str

class AnalyzeResponse(BaseModel):
    blueprint: List[BlueprintStep]
    content_type: str
    confidence: float
    insights: List[str]

@router.post("/analyze")
async def analyze_content(data: AnalyzeRequest):
    """
    Analyze content to reconstruct the creative workflow behind it
    """
    
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    
    try:
        # Generate blueprint using GPT
        blueprint_result = await generate_blueprint(data.content.strip())
        
        if not blueprint_result:
            raise HTTPException(status_code=500, detail="Failed to generate blueprint")
        
        # Format blueprint steps
        formatted_steps = []
        for step_data in blueprint_result.get("steps", []):
            formatted_steps.append(BlueprintStep(
                step=step_data.get("step", 0),
                tool=step_data.get("tool", "Unknown"),
                action=step_data.get("action", ""),
                note=step_data.get("note", "")
            ))
        
        return AnalyzeResponse(
            blueprint=formatted_steps,
            content_type=blueprint_result.get("content_type", "Unknown"),
            confidence=blueprint_result.get("confidence", 0.7),
            insights=blueprint_result.get("insights", [])
        )
        
    except Exception as e:
        logging.error(f"Content analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/analyze/batch")
async def analyze_batch_content(contents: List[str]):
    """
    Analyze multiple pieces of content for workflow patterns
    """
    
    if not contents or len(contents) == 0:
        raise HTTPException(status_code=400, detail="No content provided")
    
    try:
        results = []
        
        for i, content in enumerate(contents):
            if not content.strip():
                continue
                
            try:
                blueprint_result = await generate_blueprint(content.strip())
                
                if blueprint_result:
                    formatted_steps = []
                    for step_data in blueprint_result.get("steps", []):
                        formatted_steps.append(BlueprintStep(
                            step=step_data.get("step", 0),
                            tool=step_data.get("tool", "Unknown"),
                            action=step_data.get("action", ""),
                            note=step_data.get("note", "")
                        ))
                    
                    results.append({
                        "index": i,
                        "blueprint": formatted_steps,
                        "content_type": blueprint_result.get("content_type", "Unknown"),
                        "confidence": blueprint_result.get("confidence", 0.7)
                    })
                    
            except Exception as e:
                logging.warning(f"Failed to analyze content {i}: {e}")
                continue
        
        return {
            "results": results,
            "processed": len(results),
            "total": len(contents)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

@router.get("/analyze/patterns")
async def get_workflow_patterns():
    """
    Get common workflow patterns from analyzed content
    """
    try:
        # For demo, return common patterns
        # In production, analyze stored blueprints for patterns
        patterns = {
            "common_tools": [
                {"tool": "Notion", "frequency": 67, "use_cases": ["Planning", "Outlining", "Research"]},
                {"tool": "ChatGPT", "frequency": 54, "use_cases": ["Ideation", "Refinement", "Editing"]},
                {"tool": "Figma", "frequency": 23, "use_cases": ["Visual Design", "Mockups"]},
                {"tool": "Grammarly", "frequency": 31, "use_cases": ["Editing", "Proofreading"]}
            ],
            "workflow_templates": [
                {
                    "name": "Blog Post Creation",
                    "steps": ["Research", "Outline", "Draft", "Edit", "Publish"],
                    "avg_time": "3-4 hours",
                    "tools": ["Notion", "ChatGPT", "Grammarly"]
                },
                {
                    "name": "Social Media Thread",
                    "steps": ["Brainstorm", "Structure", "Write", "Review"],
                    "avg_time": "30-60 minutes",
                    "tools": ["Notes", "Twitter", "Buffer"]
                }
            ],
            "insights": [
                "Most creators use 3-4 tools per piece of content",
                "Research phase typically takes 20-30% of total time",
                "AI tools are used in 78% of workflows",
                "Visual content requires 40% more steps on average"
            ]
        }
        
        return patterns
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get patterns: {str(e)}")