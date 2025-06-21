# 📁 /app/services/gpt_agent.py
import openai
from openai import OpenAI
import os
import json
import logging
from typing import List, Dict, Any, Optional

# Initialize OpenAI
# openai.api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Prompt templates
BLUEPRINT_PROMPT = """You are a creativity historian AI. Given this content, return the most likely timeline of steps taken to create it. 

Analyze the content for:
- Structure and organization patterns
- Tone and style indicators
- Tool usage hints
- Creative process markers

Content to analyze:
{content}

Return a JSON response with this exact structure:
{{
  "steps": [
    {{
      "step": 1,
      "tool": "Tool name",
      "action": "What was done",
      "note": "Style/approach insight"
    }}
  ],
  "content_type": "Type of content",
  "confidence": 0.85,
  "insights": ["Key insight 1", "Key insight 2"]
}}

Focus on realistic, practical steps. Infer tools based on content structure and style."""

MEMORY_ENHANCEMENT_PROMPT = """You are helping enhance search results for a creator's memory system.

Original query: {query}
Search results: {results}

Enhance these results by:
1. Reordering by relevance to the query
2. Adding context about why each result matches
3. Highlighting key connections between results

Return the enhanced results in the same format, but with improved ordering and any additional insights."""

INPUT_TYPE_PROMPT = """Analyze this input to determine if it's a QUERY (asking about past content) or CONTENT (to be analyzed for workflow).

Input: {input}

Return JSON:
{{
  "is_query": true/false,
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation"
}}

Queries typically ask questions, use question words, or reference "past" content.
Content is usually statements, posts, articles, or creative work to analyze."""

async def generate_blueprint(content: str) -> Optional[Dict[str, Any]]:
    """
    Generate a creative blueprint for the given content using GPT-4
    """
    try:
        prompt = BLUEPRINT_PROMPT.format(content=content[:4000])  # Limit content length
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert at analyzing creative workflows and inferring the process behind content creation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        result_text = response.choices[0].message.content
        
        # Try to parse JSON response
        try:
            result = json.loads(result_text)
            return result
        except json.JSONDecodeError:
            # Fallback: try to extract JSON from the response
            import re
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                # Create a basic response if JSON parsing fails
                return create_fallback_blueprint(content)
                
    except Exception as e:
        logging.error(f"Blueprint generation failed: {e}")
        return create_fallback_blueprint(content)

def create_fallback_blueprint(content: str) -> Dict[str, Any]:
    """
    Create a basic blueprint when GPT processing fails
    """
    content_length = len(content.split())
    
    if content_length > 500:
        steps = [
            {"step": 1, "tool": "Research Tool", "action": "Gathered information and sources", "note": "Extensive content suggests research phase"},
            {"step": 2, "tool": "Notion", "action": "Organized and outlined structure", "note": "Complex content needs planning"},
            {"step": 3, "tool": "Writing Tool", "action": "Created first draft", "note": "Long-form content creation"},
            {"step": 4, "tool": "Grammarly", "action": "Edited and refined", "note": "Polish phase for quality"}
        ]
    elif content_length > 100:
        steps = [
            {"step": 1, "tool": "Brainstorming", "action": "Generated ideas", "note": "Medium content needs ideation"},
            {"step": 2, "tool": "Writing App", "action": "Drafted content", "note": "Structured writing process"},
            {"step": 3, "tool": "Review", "action": "Refined and polished", "note": "Quality check"}
        ]
    else:
        steps = [
            {"step": 1, "tool": "Quick Notes", "action": "Captured idea", "note": "Short, spontaneous content"},
            {"step": 2, "tool": "Mobile App", "action": "Formatted and posted", "note": "Simple, direct approach"}
        ]
    
    return {
        "steps": steps,
        "content_type": "text_content",
        "confidence": 0.6,
        "insights": ["Analysis completed with fallback method", "Consider uploading more content for better insights"]
    }

async def enhance_search_results(query: str, results: List[Dict[str, Any]]) -> Optional[List[Dict[str, Any]]]:
    """
    Enhance search results using GPT analysis
    """
    try:
        if not results:
            return results
        
        # Prepare results summary for GPT
        results_summary = []
        for i, result in enumerate(results[:5]):  # Limit to top 5
            results_summary.append({
                "index": i,
                "title": result.get("title", ""),
                "content": result.get("content", "")[:300],  # Truncate content
                "score": result.get("score", 0)
            })
        
        prompt = MEMORY_ENHANCEMENT_PROMPT.format(
            query=query,
            results=json.dumps(results_summary, indent=2)
        )
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You help enhance search results for a personal memory system."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        # For now, return original results
        # In production, parse GPT response and reorder/enhance
        return results
        
    except Exception as e:
        logging.error(f"Result enhancement failed: {e}")
        return results

async def determine_input_type(input_text: str) -> Dict[str, Any]:
    """
    Determine if input is a query or content to analyze
    """
    try:
        prompt = INPUT_TYPE_PROMPT.format(input=input_text[:1000])
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You analyze input to determine if it's a query or content."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=200
        )
        
        result_text = response.choices[0].message.content
        
        try:
            return json.loads(result_text)
        except json.JSONDecodeError:
            # Fallback analysis
            return analyze_input_fallback(input_text)
            
    except Exception as e:
        logging.error(f"Input type determination failed: {e}")
        return analyze_input_fallback(input_text)

def analyze_input_fallback(input_text: str) -> Dict[str, Any]:
    """
    Fallback method to determine input type
    """
    input_lower = input_text.lower()
    
    # Query indicators
    query_words = ["what", "when", "where", "how", "why", "did i", "have i", "show me", "find", "search"]
    question_marks = input_text.count("?")
    
    query_score = 0
    query_score += sum(1 for word in query_words if word in input_lower)
    query_score += question_marks * 2
    
    # Content indicators
    content_indicators = ["🧵", "\n\n", "1/", "2/", "here's", "today", "just", "published"]
    content_score = sum(1 for indicator in content_indicators if indicator in input_lower)
    
    # Length analysis
    word_count = len(input_text.split())
    if word_count > 100:
        content_score += 2
    elif word_count < 20:
        query_score += 1
    
    is_query = query_score > content_score
    confidence = min(0.9, max(0.5, abs(query_score - content_score) / max(query_score + content_score, 1)))
    
    return {
        "is_query": is_query,
        "confidence": confidence,
        "reasoning": f"Query indicators: {query_score}, Content indicators: {content_score}"
    }

# Placeholder functions for private repo features
def advanced_blueprint_generation(content: str, options: dict = None):
    """
    Placeholder for advanced blueprint with prompt chaining, style analysis
    From private repo: multi-step analysis, confidence scoring, metadata enrichment
    """
    pass

def agentic_workflow_reconstruction(content: str, context: dict = None):
    """
    Placeholder for agentic blueprint generation
    From private repo: tool inference, workflow templates, pattern matching
    """
    pass