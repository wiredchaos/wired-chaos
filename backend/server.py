from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="WIRED CHAOS API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ReferralLead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    service_interest: str
    source_agent: str = "neuro_lab"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "pending"

class ReferralLeadCreate(BaseModel):
    name: str
    email: str
    service_interest: str
    source_agent: Optional[str] = "neuro_lab"

class AgentMetrics(BaseModel):
    agent_name: str
    visits: int = 0
    conversions: int = 0
    last_activity: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Basic API routes
@api_router.get("/")
async def root():
    return {"message": "WIRED CHAOS API Online 🧠", "status": "active"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# NEURO Intake System
@api_router.post("/referral/submit", response_model=ReferralLead)
async def submit_referral_lead(lead_data: ReferralLeadCreate):
    """Submit a lead through NEURO Intake system for tracking and monetization"""
    try:
        lead_dict = lead_data.dict()
        lead_obj = ReferralLead(**lead_dict)
        
        # Store in database
        result = await db.referral_leads.insert_one(lead_obj.dict())
        
        # Update agent metrics
        await update_agent_metrics(lead_data.source_agent or "neuro_lab", conversion=True)
        
        return lead_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit lead: {str(e)}")

@api_router.get("/referral/leads", response_model=List[ReferralLead])
async def get_referral_leads():
    """Get all referral leads for tracking"""
    try:
        leads = await db.referral_leads.find().sort("timestamp", -1).to_list(1000)
        return [ReferralLead(**lead) for lead in leads]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch leads: {str(e)}")

@api_router.get("/referral/leads/{lead_id}")
async def get_referral_lead(lead_id: str):
    """Get specific referral lead by ID"""
    try:
        lead = await db.referral_leads.find_one({"id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        return ReferralLead(**lead)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch lead: {str(e)}")

# Agent Metrics & Tracking
@api_router.post("/agent/visit/{agent_name}")
async def track_agent_visit(agent_name: str):
    """Track visits to each agent page"""
    try:
        await update_agent_metrics(agent_name, visit=True)
        return {"message": f"Visit tracked for {agent_name}", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track visit: {str(e)}")

@api_router.get("/agent/metrics", response_model=List[AgentMetrics])
async def get_agent_metrics():
    """Get metrics for all agents"""
    try:
        metrics = await db.agent_metrics.find().to_list(100)
        return [AgentMetrics(**metric) for metric in metrics]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch metrics: {str(e)}")

@api_router.get("/agent/metrics/{agent_name}")
async def get_agent_metric(agent_name: str):
    """Get metrics for specific agent"""
    try:
        metric = await db.agent_metrics.find_one({"agent_name": agent_name})
        if not metric:
            # Create new metric if doesn't exist
            new_metric = AgentMetrics(agent_name=agent_name)
            await db.agent_metrics.insert_one(new_metric.dict())
            return new_metric
        return AgentMetrics(**metric)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch agent metric: {str(e)}")

# RSS Feed Management (for BWB and VRG agents)
@api_router.get("/rss/feeds")
async def get_rss_feeds():
    """Get RSS feeds for content aggregation"""
    # Placeholder for RSS feed integration
    return {
        "feeds": [
            {"name": "Crypto News", "url": "https://example.com/crypto.rss", "status": "active"},
            {"name": "Tech Updates", "url": "https://example.com/tech.rss", "status": "active"}
        ],
        "last_updated": datetime.now(timezone.utc)
    }

# Streaming Status (for CSN agent)
@api_router.get("/stream/status")
async def get_stream_status():
    """Get current streaming status for CSN"""
    return {
        "station": "33.3 FM",
        "status": "live",
        "current_show": "Crypto Spaces Network",
        "listeners": 42,  # Mock data
        "social": "@cryptospacesnet"
    }

# Helper Functions
async def update_agent_metrics(agent_name: str, visit: bool = False, conversion: bool = False):
    """Update metrics for an agent"""
    try:
        existing_metric = await db.agent_metrics.find_one({"agent_name": agent_name})
        
        if existing_metric:
            update_data = {"last_activity": datetime.now(timezone.utc)}
            if visit:
                update_data["visits"] = existing_metric.get("visits", 0) + 1
            if conversion:
                update_data["conversions"] = existing_metric.get("conversions", 0) + 1
            
            await db.agent_metrics.update_one(
                {"agent_name": agent_name},
                {"$set": update_data}
            )
        else:
            # Create new metric
            new_metric = AgentMetrics(
                agent_name=agent_name,
                visits=1 if visit else 0,
                conversions=1 if conversion else 0
            )
            await db.agent_metrics.insert_one(new_metric.dict())
            
    except Exception as e:
        logger.error(f"Failed to update agent metrics: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Log startup
logger.info("WIRED CHAOS 🧠 API Server Started")