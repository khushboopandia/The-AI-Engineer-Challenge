from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
#from openai import OpenAI
import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS so the frontend can talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

#client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


class ChatRequest(BaseModel):
    message: str

@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/api/chat")
def chat(request: ChatRequest):
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")
    
    try:
        user_message = request.message
        response = client.messages.create(
            model="claude-sonnet-5-5",
            # Thinking tokens count toward max_tokens, so leave room for the
            # thinking plus the visible reply.
            max_tokens=16000,
            system="You are a supportive mental coach.",
            messages=[
                {"role": "user", "content": user_message}
            ],
        )
        # Claude Sonnet 5.5 thinks by default, so response.content can start
        # with a "thinking" block (which has no .text). Collect only the
        # "text" blocks to build the reply.
        reply = "".join(
            block.text for block in response.content if block.type == "text"
        )
        if not reply:
            raise HTTPException(
                status_code=502,
                detail=f"Claude returned no text (stop_reason: {response.stop_reason})",
            )
        return {"reply": reply}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling Anthropic API: {str(e)}")
