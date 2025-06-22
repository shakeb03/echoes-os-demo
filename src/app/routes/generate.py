# 📁 /app/routes/generate.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI # Import OpenAI class
import os
import logging # Added for better error logging
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

# Initialize the OpenAI client globally.
# The OpenAI() constructor automatically looks for the OPENAI_API_KEY environment variable.
# It's good practice to handle potential initialization errors.
try:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except Exception as e:
    logging.error(f"Failed to initialize OpenAI client in generate.py. Ensure OPENAI_API_KEY is set: {e}")
    # In a production app, you might want to consider exiting or
    # making the router unavailable if the client is essential.
    pass # Will be handled by the actual API calls if client is None

class GenerateRequest(BaseModel):
    prompt: str

@router.post("/generate")
async def generate_content(request: GenerateRequest):
    # Ensure the client is initialized before making calls
    if not isinstance(client, OpenAI):
        raise HTTPException(status_code=500, detail="OpenAI client not initialized. Check API key.")

    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required.")

    try:
        # Use client.chat.completions.create for async calls
        response = client.chat.completions.create(
            model="gpt-4o", # Model remains the same
            messages=[
                {"role": "system", "content": "You are a helpful AI writing assistant."},
                {"role": "user", "content": request.prompt}
            ],
            temperature=0.8,
            max_tokens=800,
        )

        # Access generated text using dot notation
        generated_text = response.choices[0].message.content.strip()
        return {"output": generated_text}

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("OpenAI error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate content from OpenAI.")