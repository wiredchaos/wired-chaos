# HRM + VRG Implementation Plan
# Human Resource Management + Virtual Reality Gateway System

import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# HRM Models
class User(BaseModel):
    id: str
    username: str
    email: str
    role: str = "member"  # member, moderator, admin
    tier: str = "Bronze"  # Bronze, Silver, Gold
    xp: int = 0
    level: int = 1
    created_at: datetime
    last_active: datetime
    profile: Dict[str, Any] = {}

class XPEvent(BaseModel):
    user_id: str
    event_type: str  # login, post, comment, achievement, etc.
    points: int
    description: str
    timestamp: datetime

class VRGSession(BaseModel):
    session_id: str
    user_id: str
    gateway_type: str  # web3, ai_brain, vault, motherboard
    start_time: datetime
    end_time: Optional[datetime] = None
    xp_earned: int = 0
    achievements: List[str] = []

# VRG Configuration
VRG_RULES = {
    "xp_events": {
        "daily_login": 10,
        "first_certificate_mint": 50,
        "brain_assistant_chat": 5,
        "vault_exploration": 15,
        "motherboard_tour": 20,
        "social_share": 25,
        "community_help": 30,
        "bug_report": 40,
        "feature_suggestion": 35
    },
    "tier_thresholds": {
        "Bronze": 0,
        "Silver": 500,
        "Gold": 1500
    },
    "level_formula": "xp // 100 + 1",  # Level = XP / 100 + 1
    "tier_benefits": {
        "Bronze": ["Basic access", "Standard support"],
        "Silver": ["Priority support", "Beta features", "Discord Silver role"],
        "Gold": ["VIP support", "Early access", "Discord Gold role", "Direct dev contact"]
    }
}

# HRM Service Class
class HRMService:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.xp_history: List[XPEvent] = []
        self.vrg_sessions: List[VRGSession] = []

    def create_user(self, user_data: Dict[str, Any]) -> User:
        """Create new user with default settings"""
        user = User(
            id=user_data.get("id", f"user_{len(self.users) + 1}"),
            username=user_data["username"],
            email=user_data["email"],
            created_at=datetime.now(),
            last_active=datetime.now()
        )
        self.users[user.id] = user
        logger.info(f"Created new user: {user.username}")
        return user

    def award_xp(self, user_id: str, event_type: str, custom_points: Optional[int] = None) -> XPEvent:
        """Award XP to user for specific event"""
        if user_id not in self.users:
            raise ValueError(f"User {user_id} not found")
        
        user = self.users[user_id]
        points = custom_points or VRG_RULES["xp_events"].get(event_type, 0)
        
        # Create XP event
        xp_event = XPEvent(
            user_id=user_id,
            event_type=event_type,
            points=points,
            description=f"Earned {points} XP for {event_type}",
            timestamp=datetime.now()
        )
        
        # Update user XP and level
        user.xp += points
        user.level = eval(VRG_RULES["level_formula"], {"xp": user.xp})
        user.last_active = datetime.now()
        
        # Check for tier promotion
        new_tier = self.calculate_tier(user.xp)
        if new_tier != user.tier:
            user.tier = new_tier
            logger.info(f"User {user.username} promoted to {new_tier} tier!")
        
        self.xp_history.append(xp_event)
        logger.info(f"Awarded {points} XP to {user.username} for {event_type}")
        return xp_event

    def calculate_tier(self, xp: int) -> str:
        """Calculate user tier based on XP"""
        for tier in ["Gold", "Silver", "Bronze"]:
            if xp >= VRG_RULES["tier_thresholds"][tier]:
                return tier
        return "Bronze"

    def start_vrg_session(self, user_id: str, gateway_type: str) -> VRGSession:
        """Start new VRG session"""
        session = VRGSession(
            session_id=f"vrg_{user_id}_{len(self.vrg_sessions) + 1}",
            user_id=user_id,
            gateway_type=gateway_type,
            start_time=datetime.now()
        )
        self.vrg_sessions.append(session)
        
        # Award login XP if first session today
        self.award_xp(user_id, "daily_login")
        
        logger.info(f"Started VRG session for user {user_id}: {gateway_type}")
        return session

    def end_vrg_session(self, session_id: str, achievements: List[str] = []) -> VRGSession:
        """End VRG session and calculate rewards"""
        session = next((s for s in self.vrg_sessions if s.session_id == session_id), None)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session.end_time = datetime.now()
        session.achievements = achievements
        
        # Calculate session XP based on duration and achievements
        duration_minutes = (session.end_time - session.start_time).total_seconds() / 60
        base_xp = min(int(duration_minutes), 30)  # Max 30 XP for time
        achievement_xp = len(achievements) * 10  # 10 XP per achievement
        
        session.xp_earned = base_xp + achievement_xp
        
        # Award session XP
        if session.xp_earned > 0:
            self.award_xp(session.user_id, f"vrg_session_{session.gateway_type}", session.xp_earned)
        
        logger.info(f"Ended VRG session {session_id}: {session.xp_earned} XP earned")
        return session

    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive user statistics"""
        if user_id not in self.users:
            raise ValueError(f"User {user_id} not found")
        
        user = self.users[user_id]
        user_events = [e for e in self.xp_history if e.user_id == user_id]
        user_sessions = [s for s in self.vrg_sessions if s.user_id == user_id]
        
        return {
            "user": user.dict(),
            "stats": {
                "total_xp": user.xp,
                "current_level": user.level,
                "current_tier": user.tier,
                "tier_benefits": VRG_RULES["tier_benefits"][user.tier],
                "next_tier_xp": self.get_next_tier_xp(user.xp, user.tier),
                "total_events": len(user_events),
                "total_sessions": len(user_sessions),
                "days_active": self.calculate_active_days(user_events)
            },
            "recent_activity": sorted([e.dict() for e in user_events[-10:]], 
                                    key=lambda x: x["timestamp"], reverse=True)
        }

    def get_next_tier_xp(self, current_xp: int, current_tier: str) -> Optional[int]:
        """Calculate XP needed for next tier"""
        tiers = ["Bronze", "Silver", "Gold"]
        if current_tier == "Gold":
            return None
        
        current_index = tiers.index(current_tier)
        next_tier = tiers[current_index + 1]
        return VRG_RULES["tier_thresholds"][next_tier] - current_xp

    def calculate_active_days(self, events: List[XPEvent]) -> int:
        """Calculate number of unique active days"""
        dates = set(e.timestamp.date() for e in events)
        return len(dates)

# Initialize HRM service
hrm_service = HRMService()

# FastAPI Routes
def setup_hrm_routes(app: FastAPI):
    """Setup HRM API routes"""
    
    @app.post("/api/hrm/users", tags=["HRM"])
    async def create_user(user_data: dict):
        """Create new user"""
        try:
            user = hrm_service.create_user(user_data)
            return {"success": True, "user": user.dict()}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @app.get("/api/hrm/users/{user_id}", tags=["HRM"])
    async def get_user_stats(user_id: str):
        """Get user statistics and profile"""
        try:
            stats = hrm_service.get_user_stats(user_id)
            return {"success": True, "data": stats}
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

    @app.post("/api/hrm/xp/award", tags=["HRM"])
    async def award_xp(data: dict):
        """Award XP to user"""
        try:
            xp_event = hrm_service.award_xp(
                data["user_id"], 
                data["event_type"], 
                data.get("custom_points")
            )
            return {"success": True, "xp_event": xp_event.dict()}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @app.post("/api/vrg/session/start", tags=["VRG"])
    async def start_vrg_session(data: dict):
        """Start VRG session"""
        try:
            session = hrm_service.start_vrg_session(data["user_id"], data["gateway_type"])
            return {"success": True, "session": session.dict()}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @app.post("/api/vrg/session/end", tags=["VRG"])
    async def end_vrg_session(data: dict):
        """End VRG session"""
        try:
            session = hrm_service.end_vrg_session(
                data["session_id"], 
                data.get("achievements", [])
            )
            return {"success": True, "session": session.dict()}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @app.get("/api/vrg/rules", tags=["VRG"])
    async def get_vrg_rules():
        """Get VRG configuration and rules"""
        return {"success": True, "rules": VRG_RULES}

    @app.get("/api/hrm/leaderboard", tags=["HRM"])
    async def get_leaderboard(limit: int = 10):
        """Get top users leaderboard"""
        try:
            sorted_users = sorted(hrm_service.users.values(), key=lambda u: u.xp, reverse=True)
            leaderboard = [
                {
                    "rank": i + 1,
                    "username": user.username,
                    "xp": user.xp,
                    "level": user.level,
                    "tier": user.tier
                }
                for i, user in enumerate(sorted_users[:limit])
            ]
            return {"success": True, "leaderboard": leaderboard}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Test the HRM system
    print("🤖 HRM + VRG System Test")
    
    # Create test user
    test_user = hrm_service.create_user({
        "username": "test_user",
        "email": "test@wiredchaos.com"
    })
    print(f"Created user: {test_user.username}")
    
    # Award some XP
    events = ["daily_login", "brain_assistant_chat", "first_certificate_mint"]
    for event in events:
        xp_event = hrm_service.award_xp(test_user.id, event)
        print(f"Awarded XP: {xp_event.description}")
    
    # Start and end VRG session
    session = hrm_service.start_vrg_session(test_user.id, "ai_brain")
    import time
    time.sleep(1)  # Simulate session duration
    ended_session = hrm_service.end_vrg_session(session.session_id, ["completed_tour"])
    
    # Get user stats
    stats = hrm_service.get_user_stats(test_user.id)
    print(f"\nUser Stats:")
    print(f"XP: {stats['stats']['total_xp']}")
    print(f"Level: {stats['stats']['current_level']}")
    print(f"Tier: {stats['stats']['current_tier']}")
    print(f"Benefits: {stats['stats']['tier_benefits']}")
    
    print("\n✅ HRM + VRG System Test Complete!")