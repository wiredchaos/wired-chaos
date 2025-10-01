"""
SWARM Grant Bot - FastAPI Server

Provides REST API endpoints for grant automation.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

from grants_bot import GrantBot
from grants_bot.config import get_config

# Initialize FastAPI
app = FastAPI(
    title="SWARM Grant Bot API",
    description="Next-generation grant automation system",
    version="1.0.0"
)

# Configure CORS
config = get_config()
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.api.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Grant Bot (single tenant for now)
bot = GrantBot(tenant_id=config.tenant.default_tenant_id)


# Request/Response Models
class DiscoverRequest(BaseModel):
    use_cache: bool = False


class FilterRequest(BaseModel):
    min_match_score: Optional[float] = 0.3
    categories: Optional[List[str]] = None


class DraftRequest(BaseModel):
    grant_id: str
    use_llm: bool = False


class SubmitRequest(BaseModel):
    grant_id: str
    application_id: str
    method: str = "api"


# API Endpoints

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "name": "SWARM Grant Bot API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    stats = bot.get_stats()
    return {
        "status": "healthy",
        "tenant_id": bot.tenant_id,
        "stats": stats
    }


@app.post("/api/grants/discover")
async def discover_grants(request: DiscoverRequest):
    """
    Discover grants from all configured sources
    
    Returns list of grant opportunities
    """
    try:
        grants = await bot.discover_grants(use_cache=request.use_cache)
        return {
            "success": True,
            "count": len(grants),
            "grants": grants
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/grants/eligible")
async def get_eligible_grants(request: FilterRequest):
    """
    Get eligible grants based on organization profile
    
    Returns filtered and prioritized grants
    """
    try:
        # Discover grants
        grants = await bot.discover_grants(use_cache=True)
        
        # Filter for eligibility
        eligible = await bot.filter_eligible(grants)
        
        # Apply additional filters if specified
        if request.categories:
            eligible = [g for g in eligible if g.get('category') in request.categories]
        
        # Prioritize
        prioritized = await bot.prioritize_grants(eligible)
        
        return {
            "success": True,
            "total_discovered": len(grants),
            "eligible_count": len(prioritized),
            "grants": prioritized
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/grants/{grant_id}")
async def get_grant(grant_id: str):
    """Get details for a specific grant"""
    try:
        grants = await bot.discover_grants(use_cache=True)
        grant = next((g for g in grants if g.get('grant_id') == grant_id), None)
        
        if not grant:
            raise HTTPException(status_code=404, detail="Grant not found")
        
        return {
            "success": True,
            "grant": grant
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/applications/draft")
async def draft_application(request: DraftRequest):
    """
    Draft application for a grant
    
    Returns drafted application content
    """
    try:
        # Get grant
        grants = await bot.discover_grants(use_cache=True)
        grant = next((g for g in grants if g.get('grant_id') == request.grant_id), None)
        
        if not grant:
            raise HTTPException(status_code=404, detail="Grant not found")
        
        # Draft application
        application = await bot.draft_application(grant, use_llm=request.use_llm)
        
        return {
            "success": True,
            "application": application
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/applications/submit")
async def submit_application(request: SubmitRequest):
    """
    Submit grant application
    
    Returns submission confirmation
    """
    try:
        # Get grant
        grants = await bot.discover_grants(use_cache=True)
        grant = next((g for g in grants if g.get('grant_id') == request.grant_id), None)
        
        if not grant:
            raise HTTPException(status_code=404, detail="Grant not found")
        
        # Get application (in production, would retrieve from database)
        application = {'grant_id': request.application_id}
        
        # Submit
        result = await bot.submit_application(grant, application, method=request.method)
        
        return {
            "success": True,
            "submission": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/applications/status/{submission_id}")
async def check_application_status(submission_id: str):
    """Check status of submitted application"""
    try:
        status = await bot.check_status(submission_id)
        
        if not status:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return {
            "success": True,
            "status": status
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats")
async def get_statistics():
    """Get comprehensive bot statistics"""
    stats = bot.get_stats()
    return {
        "success": True,
        "stats": stats
    }


if __name__ == "__main__":
    # Run server
    uvicorn.run(
        app,
        host=config.api.api_host,
        port=config.api.api_port,
        log_level=config.development.log_level.lower()
    )
