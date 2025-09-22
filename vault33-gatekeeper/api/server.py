"""
VAULT33 Gatekeeper - FastAPI Webhook Server
Handles XRPL webhooks and provides API endpoints
"""
import hmac
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Request, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from loguru import logger

from ..shared.config import Config
from ..shared.database import db_manager
from ..shared.gamification import gamification
from ..shared.utils import verify_webhook_signature

# FastAPI app instance
app = FastAPI(
    title="VAULT33 Gatekeeper API",
    description="Webhook and API endpoints for VAULT33 gamification system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for webhook payloads
class WebhookPayload(BaseModel):
    event: str = Field(..., description="Event type (token_minted, token_burned)")
    network: str = Field(default="XRPL", description="Blockchain network")
    tx: str = Field(..., description="Transaction hash")
    token_id: str = Field(..., description="Token ID")
    owner: Optional[str] = Field(None, description="Token owner address")
    discord_id: Optional[int] = Field(None, description="Discord user ID")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class UserStatusResponse(BaseModel):
    total_points: int
    raffle_tickets: int
    fragments_unlocked: list[int]
    roles: list[str]
    fragment_count: int
    sangreal_unlocked: bool

class PointsGrantRequest(BaseModel):
    discord_id: int
    amount: int
    reason: str

# Database dependency
async def get_db():
    if not db_manager.db:
        await db_manager.connect()
    return db_manager

# Webhook signature verification dependency
async def verify_webhook(
    request: Request,
    x_signature: Optional[str] = Header(None, alias="X-Signature")
) -> bytes:
    """Verify webhook signature"""
    if not x_signature:
        raise HTTPException(status_code=401, detail="Missing signature header")
    
    body = await request.body()
    
    if not verify_webhook_signature(body, x_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    return body

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    await db_manager.connect()
    logger.info("🌐 VAULT33 Gatekeeper API started")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await db_manager.close()
    logger.info("🌐 VAULT33 Gatekeeper API shut down")

@app.get("/")
async def root():
    """API health check"""
    return {
        "service": "VAULT33 Gatekeeper API",
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Test database connection
        await db_manager.db.admin.command('ping')
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/xrpl/webhook")
async def xrpl_webhook(
    payload: WebhookPayload,
    body: bytes = Depends(verify_webhook),
    db = Depends(get_db)
):
    """Handle XRPL webhook events"""
    try:
        logger.info(f"📡 Received webhook event: {payload.event} for token {payload.token_id}")
        
        if payload.event == "token_minted":
            # Handle mint event
            if payload.discord_id:
                # Extract tier from metadata or default to tier1
                tier = payload.metadata.get("tier", "tier1")
                
                result = await gamification.process_mint(
                    payload.discord_id,
                    tier,
                    payload.token_id,
                    payload.tx
                )
                
                if result["success"]:
                    logger.info(f"🎯 Mint processed successfully for user {payload.discord_id}")
                else:
                    logger.error(f"❌ Mint processing failed: {result.get('error')}")
                
                return {"status": "processed", "result": result}
            else:
                return {"status": "skipped", "reason": "No discord_id provided"}
        
        elif payload.event == "token_burned":
            # Handle burn event
            if payload.discord_id:
                result = await gamification.process_burn(
                    payload.discord_id,
                    payload.token_id,
                    payload.tx
                )
                
                if result["success"]:
                    logger.info(f"🔥 Burn processed successfully for user {payload.discord_id}")
                    
                    # If fragment unlocked, could trigger additional notifications here
                    if result.get("fragment_unlocked"):
                        logger.info(f"🧩 Fragment {result['fragment_unlocked']} unlocked for user {payload.discord_id}")
                else:
                    logger.error(f"❌ Burn processing failed: {result.get('error')}")
                
                return {"status": "processed", "result": result}
            else:
                return {"status": "skipped", "reason": "No discord_id provided"}
        
        else:
            logger.warning(f"⚠️ Unknown webhook event: {payload.event}")
            return {"status": "ignored", "reason": f"Unknown event type: {payload.event}"}
    
    except Exception as e:
        logger.error(f"❌ Webhook processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/{discord_id}/status", response_model=UserStatusResponse)
async def get_user_status(discord_id: int, db = Depends(get_db)):
    """Get user status by Discord ID"""
    try:
        status = await gamification.get_user_status(discord_id)
        
        if "error" in status:
            raise HTTPException(status_code=404, detail=status["error"])
        
        return UserStatusResponse(**status)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get user status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/{discord_id}/fragments")
async def get_user_fragments(discord_id: int, db = Depends(get_db)):
    """Get user's unlocked fragments with hints"""
    try:
        fragments = await db_manager.get_user_fragments(discord_id)
        
        fragment_data = []
        for fragment_index in fragments:
            hint = gamification.get_fragment_hint(fragment_index)
            fragment_data.append({
                "index": fragment_index,
                "hint": hint,
                "unlocked": True
            })
        
        # Add next available fragment hint if not all unlocked
        if len(fragments) < 5:
            next_hint_data = await gamification.get_next_fragment_hint(discord_id)
            if next_hint_data:
                next_index, next_hint = next_hint_data
                fragment_data.append({
                    "index": next_index,
                    "hint": next_hint,
                    "unlocked": False
                })
        
        return {
            "discord_id": discord_id,
            "fragments": fragment_data,
            "total_unlocked": len(fragments),
            "sangreal_unlocked": len(fragments) >= 5
        }
    
    except Exception as e:
        logger.error(f"❌ Get user fragments error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/token/{token_id}")
async def get_token_info(token_id: str, db = Depends(get_db)):
    """Get token information"""
    try:
        token = await db_manager.get_token(token_id)
        
        if not token:
            raise HTTPException(status_code=404, detail="Token not found")
        
        return {
            "token_id": token_id,
            "owner_discord_id": token["owner_discord_id"],
            "burn_status": token["burn_status"],
            "created_at": token.get("created_at"),
            "burned_at": token.get("burned_at"),
            "metadata": token.get("metadata", {})
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get token info error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/grant-points")
async def admin_grant_points(
    request: PointsGrantRequest,
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
    db = Depends(get_db)
):
    """Admin endpoint to grant points to user"""
    try:
        # Simple admin key verification (enhance for production)
        if x_admin_key != Config.WEBHOOK_SECRET:
            raise HTTPException(status_code=401, detail="Invalid admin key")
        
        success = await db_manager.add_points(
            request.discord_id,
            request.amount,
            request.reason
        )
        
        if success:
            return {
                "status": "success",
                "discord_id": request.discord_id,
                "points_granted": request.amount,
                "reason": request.reason
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to grant points")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Admin grant points error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/leaderboard")
async def get_leaderboard(limit: int = 10, db = Depends(get_db)):
    """Get points leaderboard"""
    try:
        pipeline = [
            {"$match": {"total_points": {"$gt": 0}}},
            {"$sort": {"total_points": -1}},
            {"$limit": limit},
            {"$project": {
                "discord_id": 1,
                "total_points": 1,
                "_id": 0
            }}
        ]
        
        results = await db_manager.db.users.aggregate(pipeline).to_list(limit)
        
        return {
            "leaderboard": results,
            "total_users": len(results),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    except Exception as e:
        logger.error(f"❌ Leaderboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return {"error": "Not found", "detail": exc.detail}

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: HTTPException):
    logger.error(f"❌ Internal server error: {exc}")
    return {"error": "Internal server error", "detail": "An unexpected error occurred"}