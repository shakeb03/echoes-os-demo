# 📁 /app/routes/analyze.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Union
import os # Import os to access environment variables
from openai import OpenAI
import logging # For logging potential errors

router = APIRouter()

# Initialize the OpenAI client globally.
# It's crucial to get the API key from environment variables for production.
# The OpenAI() constructor automatically looks for the OPENAI_API_KEY environment variable.
# If not found, you can explicitly pass it: api_key=os.environ.get("OPENAI_API_KEY")
try:
    client = OpenAI()
except Exception as e:
    logging.error(f"Failed to initialize OpenAI client. Ensure OPENAI_API_KEY is set: {e}")
    pass

class AnalyzeRequest(BaseModel):
    step: int
    content: Optional[str] = None  # For Step 1
    basePrompts: Optional[List[str]] = None  # For Step 2
    title: Optional[str] = None
    topics: Optional[str] = None
    context: Optional[str] = None

@router.post("/analyze")
async def analyze_content(request: AnalyzeRequest):
    # Ensure the client is initialized before making calls
    logging.info("request.step: %s", request.step)
    if not isinstance(client, OpenAI):
        raise HTTPException(status_code=500, detail="OpenAI client not initialized. Check API key.")

    if request.step == 1:
        logging.info("Processing Step 1")
        if not request.content or not request.content.strip():
            raise HTTPException(status_code=400, detail="Content cannot be empty for step 1")

        prompt = f"""
You are an AI creativity historian. The user will give you some content they previously created. Your job is to reverse-engineer the likely prompts that could have originally produced this content using an LLM like GPT. Keep the tone, structure, and goal in mind.

Content:
\"\"\"
{request.content}
\"\"\"

Return 3-5 realistic prompts that could have generated this content.
"""
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
            )
            # FIX: Removed 'await' here
            text = response.choices[0].message.content
            prompts = [p.strip("- ").strip() for p in text.split("\n") if p.strip()]
            return {"prompts": prompts[:5]}
        except Exception as e:
            logging.error(f"OpenAI API error in step 1: {e}")
            raise HTTPException(status_code=500, detail="Error generating prompts from OpenAI.")

    elif request.step == 2:
        logging.info("Processing Step 2")
        if not request.basePrompts or not request.title or not request.topics or not request.context:
            logging.error("Validation failed for Step 2: Missing required fields")
            raise HTTPException(status_code=400, detail="Missing required fields for step 2: basePrompts, title, topics, context")

        seed = "\n".join(f"- {p}" for p in request.basePrompts)
        full_prompt = f"""
You are a creative AI assistant helping a content creator generate a brand-new idea.

Base prompts (reverse-engineered from prior work):
{seed}

New content guidance:
Title: {request.title}
Topics: {request.topics}
Context: {request.context}

Using the style, tone, and patterns from the base prompts, write a single strong prompt that could be used in GPT-4 to generate the desired new content.
"""
        logging.info(f"Generated full prompt for Step 2: {full_prompt}")
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": full_prompt}],
                temperature=0.75,
            )
            logging.info(f"OpenAI response for Step 2: {response}")
            result = response.choices[0].message.content.strip()
            logging.info(f"Generated final prompt for Step 2: {result}")
            return {"finalPrompt": result}
        except Exception as e:
            logging.error(f"OpenAI API error in Step 2: {e}")
            raise HTTPException(status_code=500, detail="Error generating the final prompt from OpenAI.")

    else:
        logging.error(f"Invalid step: {request.step}")
        raise HTTPException(status_code=400, detail="Invalid step. Use step 1 or 2.")
    