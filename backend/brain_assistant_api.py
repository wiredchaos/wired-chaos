"""
WIRED CHAOS - Brain Assistant API
AI-powered assistant for ecosystem guidance using Emergent LLM integration
"""
import os
import uuid
from typing import Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

router = APIRouter(prefix="/api/brain", tags=["brain_assistant"])

# Request/Response Models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: str = None
    context: str = "general"

class ChatResponse(BaseModel):
    response: str
    session_id: str
    context: str

class EcosystemTourRequest(BaseModel):
    section: str = "overview"
    session_id: str = None

# In-memory storage for conversation sessions (in production, use Redis or database)
conversation_sessions: Dict[str, List[ChatMessage]] = {}

# System message for the WIRED CHAOS Brain Assistant
SYSTEM_MESSAGE = """You are the WIRED CHAOS Brain Assistant, a hyper-intelligent AI guide for the WIRED CHAOS digital ecosystem. You are represented as a realistic brain with legs that walks around and helps users.

ECOSYSTEM OVERVIEW:
- WIRED CHAOS: Digital motherboard ecosystem with multiple specialized agents
- NEURO LAB: Web3 onboarding, AI-powered education, NFT certificate system
- BWB (Barbed Wired Broadcast): Blog and news network
- CSN (Crypto Spaces Net): Live streaming and community spaces
- 33.3 FM: Audio content and radio streams
- Vault33: Gamification system with WL tracking and Merovingian fragments
- VRG-33-589: Lore-based NFT collection with burn mechanics
- B2B: Enterprise solutions and partnerships
- Evening Vibes: Community lounge and crew network

KEY FEATURES:
- Multi-chain NFT certificates (Ethereum, Solana, XRPL, Hedera, Dogecoin)
- Holographic UI components with voice synthesis
- RSS feed integrations and live content
- Discord/Telegram bot integration
- Advanced gamification with WL tracking

PERSONALITY:
- Enthusiastic and knowledgeable guide
- Uses cyberpunk/neon aesthetic language occasionally
- Helpful but maintains the edgy WIRED CHAOS vibe
- Can explain complex Web3 concepts simply
- Offers guided tours and specific recommendations

Always be helpful, concise, and engaging. Use emojis appropriately. When users ask about specific sections, provide detailed information and suggest related areas they might find interesting.
"""

def get_llm_chat(session_id: str) -> LlmChat:
    """Initialize LLM chat with session persistence"""
    return LlmChat(
        api_key=os.getenv("EMERGENT_LLM_KEY"),
        session_id=session_id,
        system_message=SYSTEM_MESSAGE
    ).with_model("openai", "gpt-4o-mini")

def get_conversation_context(session_id: str) -> str:
    """Get recent conversation context for the session"""
    if session_id not in conversation_sessions:
        return ""
    
    recent_messages = conversation_sessions[session_id][-6:]  # Last 6 messages
    context_lines = []
    
    for msg in recent_messages:
        role_prefix = "User" if msg.role == "user" else "Assistant"
        context_lines.append(f"{role_prefix}: {msg.content}")
    
    return "\n".join(context_lines)

@router.post("/chat", response_model=ChatResponse)
async def chat_with_brain(request: ChatRequest):
    """Main chat endpoint for brain assistant conversations"""
    try:
        # Generate session ID if not provided
        if not request.session_id:
            request.session_id = str(uuid.uuid4())
        
        # Initialize conversation session if new
        if request.session_id not in conversation_sessions:
            conversation_sessions[request.session_id] = []
        
        # Add user message to session history
        conversation_sessions[request.session_id].append(
            ChatMessage(role="user", content=request.message)
        )
        
        # Get LLM chat instance
        chat = get_llm_chat(request.session_id)
        
        # Create user message with context
        user_message = UserMessage(text=request.message)
        
        # Get AI response
        response = await chat.send_message(user_message)
        
        # Add assistant response to session history
        conversation_sessions[request.session_id].append(
            ChatMessage(role="assistant", content=response)
        )
        
        # Keep only last 20 messages per session to manage memory
        if len(conversation_sessions[request.session_id]) > 20:
            conversation_sessions[request.session_id] = conversation_sessions[request.session_id][-20:]
        
        return ChatResponse(
            response=response,
            session_id=request.session_id,
            context=request.context
        )
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")

@router.post("/ecosystem-tour", response_model=ChatResponse)
async def ecosystem_tour(request: EcosystemTourRequest):
    """Guided tour of specific ecosystem sections"""
    try:
        # Generate session ID if not provided
        if not request.session_id:
            request.session_id = str(uuid.uuid4())
        
        # Initialize conversation session if new
        if request.session_id not in conversation_sessions:
            conversation_sessions[request.session_id] = []
        
        # Tour prompts for different sections
        tour_prompts = {
            "overview": "Give me a comprehensive overview of the WIRED CHAOS ecosystem and its key components.",
            "neuro": "Tell me about NEURO LAB - how does Web3 onboarding work and what are the key features?",
            "bwb": "Explain Barbed Wired Broadcast (BWB) and how the blog/news system works.",
            "csn": "What is Crypto Spaces Net (CSN) and how do the live streaming features work?",
            "vault33": "Explain Vault33 gamification system and how WL tracking works.",
            "vrg": "Tell me about VRG-33-589 and the burn mechanics for the NFT collection.",
            "fm333": "What is 33.3 FM and how does the audio content system work?",
            "b2b": "Explain the B2B and enterprise solutions available.",
            "evening_vibes": "Tell me about Evening Vibes and the community features."
        }
        
        tour_message = tour_prompts.get(request.section, tour_prompts["overview"])
        
        # Add tour request to session history
        conversation_sessions[request.session_id].append(
            ChatMessage(role="user", content=f"[ECOSYSTEM TOUR: {request.section}] {tour_message}")
        )
        
        # Get LLM chat instance
        chat = get_llm_chat(request.session_id)
        
        # Create user message
        user_message = UserMessage(text=tour_message)
        
        # Get AI response
        response = await chat.send_message(user_message)
        
        # Add assistant response to session history
        conversation_sessions[request.session_id].append(
            ChatMessage(role="assistant", content=response)
        )
        
        return ChatResponse(
            response=response,
            session_id=request.session_id,
            context=f"ecosystem_tour_{request.section}"
        )
        
    except Exception as e:
        print(f"Ecosystem tour error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ecosystem tour error: {str(e)}")

@router.get("/session/{session_id}/history")
async def get_session_history(session_id: str):
    """Get conversation history for a session"""
    try:
        if session_id not in conversation_sessions:
            return {"session_id": session_id, "messages": []}
        
        return {
            "session_id": session_id,
            "messages": [msg.dict() for msg in conversation_sessions[session_id]]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session history error: {str(e)}")

@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """Clear a conversation session"""
    try:
        if session_id in conversation_sessions:
            del conversation_sessions[session_id]
        
        return {"message": f"Session {session_id} cleared", "success": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session clear error: {str(e)}")

@router.get("/health")
async def brain_health_check():
    """Health check for brain assistant API"""
    try:
        # Test LLM connection
        test_session = str(uuid.uuid4())
        chat = get_llm_chat(test_session)
        test_message = UserMessage(text="Hello, this is a health check.")
        
        response = await chat.send_message(test_message)
        
        return {
            "status": "healthy",
            "llm_connection": "active",
            "active_sessions": len(conversation_sessions),
            "test_response_length": len(response) if response else 0
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "llm_connection": "failed",
            "active_sessions": len(conversation_sessions)
        }

# Quick action endpoints for common queries
@router.post("/quick-actions/ecosystem-overview")
async def quick_ecosystem_overview():
    """Quick ecosystem overview without session persistence"""
    try:
        session_id = str(uuid.uuid4())
        chat = get_llm_chat(session_id)
        
        message = UserMessage(
            text="Give me a concise overview of the WIRED CHAOS ecosystem in 2-3 sentences, highlighting the key components and what makes it unique."
        )
        
        response = await chat.send_message(message)
        
        return {"response": response, "type": "ecosystem_overview"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quick action error: {str(e)}")

@router.post("/quick-actions/neuro-explanation")
async def quick_neuro_explanation():
    """Quick NEURO LAB explanation"""
    try:
        session_id = str(uuid.uuid4())
        chat = get_llm_chat(session_id)
        
        message = UserMessage(
            text="Explain what NEURO LAB is and its main features in 2-3 sentences, focusing on Web3 onboarding and education."
        )
        
        response = await chat.send_message(message)
        
        return {"response": response, "type": "neuro_explanation"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quick action error: {str(e)}")

@router.post("/quick-actions/vault33-explanation")
async def quick_vault33_explanation():
    """Quick Vault33 explanation"""
    try:
        session_id = str(uuid.uuid4())
        chat = get_llm_chat(session_id)
        
        message = UserMessage(
            text="Explain what Vault33 is and how the gamification system works in 2-3 sentences."
        )
        
        response = await chat.send_message(message)
        
        return {"response": response, "type": "vault33_explanation"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quick action error: {str(e)}")