from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import asyncio

from database import get_database
try:
    from wallet_verification import verify_holder_status
except ImportError:
    async def verify_holder_status(wallet_address: str):
        # Fallback implementation
        return {"is_holder": False, "tier": "standard"}

try:
    from blockchain_integration import create_escrow_contract, release_payment
except ImportError:
    async def create_escrow_contract(client_wallet: str, contractor_wallet: str, amount: dict, platform_fee: float):
        # Fallback implementation
        return f"0x{hash(f'{client_wallet}-{contractor_wallet}') % (10**40):040x}"
    
    async def release_payment(contract_address: str, milestone_id: str = None):
        # Fallback implementation
        return True

# Initialize router
marketplace_router = APIRouter(prefix="/api/marketplace", tags=["marketplace"])
contractor_router = APIRouter(prefix="/api/contractors", tags=["contractors"])
escrow_router = APIRouter(prefix="/api/escrow", tags=["escrow"])

security = HTTPBearer()

# Pydantic Models
class TokenAmount(BaseModel):
    amount: float
    currency: str  # ETH, SOL, XRP, HBAR, DOGE

class Milestone(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    description: str
    amount: TokenAmount
    deadline: datetime
    status: str = "pending"  # pending, completed, approved

class RFPCreate(BaseModel):
    title: str
    description: str
    budget: TokenAmount
    deadline: datetime
    required_skills: List[str]
    holder_only: bool = False
    milestones: Optional[List[Milestone]] = []

class RFPResponse(BaseModel):
    id: str
    creator_wallet: str
    title: str
    description: str
    budget: TokenAmount
    deadline: datetime
    required_skills: List[str]
    holder_only: bool
    status: str = "open"  # open, in_progress, completed, cancelled
    created_at: datetime
    bids_count: int = 0

class BidCreate(BaseModel):
    rfp_id: str
    proposed_amount: TokenAmount
    timeline: str
    approach: str
    playground_demo_url: Optional[str] = None

class BidResponse(BaseModel):
    id: str
    rfp_id: str
    contractor_wallet: str
    proposed_amount: TokenAmount
    timeline: str
    approach: str
    playground_demo_url: Optional[str]
    status: str = "pending"  # pending, accepted, rejected
    submitted_at: datetime

class ContractorProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wallet_address: str
    display_name: str
    bio: str
    skills: List[str]
    nft_badges: List[Dict[str, Any]] = []
    portfolio_items: List[Dict[str, Any]] = []
    performance_metrics: Dict[str, Any] = {
        "completed_projects": 0,
        "average_rating": 0.0,
        "on_time_delivery": 0.0
    }
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EscrowCreate(BaseModel):
    rfp_id: str
    contractor_wallet: str
    amount: TokenAmount
    milestones: List[Milestone]

class EscrowStatus(BaseModel):
    id: str
    rfp_id: str
    client_wallet: str
    contractor_wallet: str
    amount: TokenAmount
    status: str  # created, funded, in_progress, completed, disputed
    milestones: List[Milestone]
    platform_fee: float
    created_at: datetime

# Helper Functions
async def verify_wallet_ownership(wallet_address: str, token: str = Depends(security)):
    """Verify that the user owns the wallet they claim"""
    # In production, implement proper wallet signature verification
    # For now, accept the wallet address from the authenticated token
    return wallet_address

async def calculate_platform_fee(wallet_address: str) -> float:
    """Calculate platform fee based on holder status"""
    holder_status = await verify_holder_status(wallet_address)
    return 0.0 if holder_status.get("is_holder", False) else 0.025

# RFP/SOW Endpoints
@marketplace_router.post("/rfp", response_model=RFPResponse)
async def create_rfp(
    rfp_data: RFPCreate,
    creator_wallet: str = Depends(verify_wallet_ownership)
):
    """Create a new RFP/SOW"""
    try:
        db = await get_database()
        
        # Verify holder status for premium RFPs
        if rfp_data.holder_only:
            holder_status = await verify_holder_status(creator_wallet)
            if not holder_status.get("is_holder", False):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Premium RFPs require Vault Holder status"
                )
        
        rfp_doc = {
            "id": str(uuid.uuid4()),
            "creator_wallet": creator_wallet,
            "title": rfp_data.title,
            "description": rfp_data.description,
            "budget": rfp_data.budget.dict(),
            "deadline": rfp_data.deadline,
            "required_skills": rfp_data.required_skills,
            "holder_only": rfp_data.holder_only,
            "status": "open",
            "created_at": datetime.utcnow(),
            "bids_count": 0,
            "milestones": [m.dict() for m in rfp_data.milestones] if rfp_data.milestones else []
        }
        
        result = await db.rfps.insert_one(rfp_doc)
        
        # Publish event to WC-BUS
        await publish_event("rfp_created", {
            "rfp_id": rfp_doc["id"],
            "creator": creator_wallet,
            "holder_only": rfp_data.holder_only
        })
        
        return RFPResponse(**rfp_doc, bids_count=0)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create RFP: {str(e)}"
        )

@marketplace_router.get("/rfps", response_model=List[RFPResponse])
async def get_rfps(
    holder_only: Optional[bool] = None,
    skills: Optional[str] = None,
    wallet_address: Optional[str] = None
):
    """Get all available RFPs with filtering"""
    try:
        db = await get_database()
        
        # Build query filters
        query_filter = {"status": "open"}
        
        if holder_only is not None:
            query_filter["holder_only"] = holder_only
            
        if skills:
            skill_list = [s.strip() for s in skills.split(",")]
            query_filter["required_skills"] = {"$in": skill_list}
        
        # If user is not a holder, filter out premium RFPs
        if wallet_address:
            holder_status = await verify_holder_status(wallet_address)
            if not holder_status.get("is_holder", False):
                query_filter["holder_only"] = {"$ne": True}
        
        rfps = await db.rfps.find(query_filter).sort("created_at", -1).to_list(100)
        
        # Get bid counts for each RFP
        for rfp in rfps:
            bid_count = await db.bids.count_documents({"rfp_id": rfp["id"]})
            rfp["bids_count"] = bid_count
        
        return [RFPResponse(**rfp) for rfp in rfps]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch RFPs: {str(e)}"
        )

@marketplace_router.post("/bid", response_model=BidResponse)
async def submit_bid(
    bid_data: BidCreate,
    contractor_wallet: str = Depends(verify_wallet_ownership)
):
    """Submit a bid for an RFP"""
    try:
        db = await get_database()
        
        # Verify RFP exists and is open
        rfp = await db.rfps.find_one({"id": bid_data.rfp_id, "status": "open"})
        if not rfp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RFP not found or no longer accepting bids"
            )
        
        # Check if RFP is holder-only
        if rfp.get("holder_only", False):
            holder_status = await verify_holder_status(contractor_wallet)
            if not holder_status.get("is_holder", False):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="This RFP is restricted to Vault Holders"
                )
        
        # Check if contractor already bid on this RFP
        existing_bid = await db.bids.find_one({
            "rfp_id": bid_data.rfp_id,
            "contractor_wallet": contractor_wallet
        })
        if existing_bid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already submitted a bid for this RFP"
            )
        
        bid_doc = {
            "id": str(uuid.uuid4()),
            "rfp_id": bid_data.rfp_id,
            "contractor_wallet": contractor_wallet,
            "proposed_amount": bid_data.proposed_amount.dict(),
            "timeline": bid_data.timeline,
            "approach": bid_data.approach,
            "playground_demo_url": bid_data.playground_demo_url,
            "status": "pending",
            "submitted_at": datetime.utcnow()
        }
        
        await db.bids.insert_one(bid_doc)
        
        # Update RFP bid count
        await db.rfps.update_one(
            {"id": bid_data.rfp_id},
            {"$inc": {"bids_count": 1}}
        )
        
        # Publish event
        await publish_event("bid_submitted", {
            "bid_id": bid_doc["id"],
            "rfp_id": bid_data.rfp_id,
            "contractor": contractor_wallet
        })
        
        return BidResponse(**bid_doc)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit bid: {str(e)}"
        )

@marketplace_router.get("/bids/{rfp_id}", response_model=List[BidResponse])
async def get_rfp_bids(
    rfp_id: str,
    requestor_wallet: str = Depends(verify_wallet_ownership)
):
    """Get all bids for a specific RFP (only for RFP creator)"""
    try:
        db = await get_database()
        
        # Verify requestor is the RFP creator
        rfp = await db.rfps.find_one({"id": rfp_id})
        if not rfp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RFP not found"
            )
        
        if rfp["creator_wallet"] != requestor_wallet:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only RFP creator can view bids"
            )
        
        bids = await db.bids.find({"rfp_id": rfp_id}).sort("submitted_at", -1).to_list(100)
        return [BidResponse(**bid) for bid in bids]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch bids: {str(e)}"
        )

# Contractor Profile Endpoints
@contractor_router.get("/profile/{wallet_address}", response_model=ContractorProfile)
async def get_contractor_profile(wallet_address: str):
    """Get contractor profile by wallet address"""
    try:
        db = await get_database()
        
        profile = await db.contractor_profiles.find_one({"wallet_address": wallet_address})
        if not profile:
            # Create default profile
            profile = {
                "id": str(uuid.uuid4()),
                "wallet_address": wallet_address,
                "display_name": f"Contractor {wallet_address[:8]}...",
                "bio": "",
                "skills": [],
                "nft_badges": [],
                "portfolio_items": [],
                "performance_metrics": {
                    "completed_projects": 0,
                    "average_rating": 0.0,
                    "on_time_delivery": 0.0
                },
                "created_at": datetime.utcnow()
            }
            await db.contractor_profiles.insert_one(profile)
        
        return ContractorProfile(**profile)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch profile: {str(e)}"
        )

@contractor_router.put("/profile/{wallet_address}", response_model=ContractorProfile)
async def update_contractor_profile(
    wallet_address: str,
    profile_data: ContractorProfile,
    requestor_wallet: str = Depends(verify_wallet_ownership)
):
    """Update contractor profile"""
    try:
        if wallet_address != requestor_wallet:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only update your own profile"
            )
        
        db = await get_database()
        
        update_data = profile_data.dict(exclude={"id", "wallet_address", "created_at"})
        update_data["updated_at"] = datetime.utcnow()
        
        await db.contractor_profiles.update_one(
            {"wallet_address": wallet_address},
            {"$set": update_data},
            upsert=True
        )
        
        updated_profile = await db.contractor_profiles.find_one({"wallet_address": wallet_address})
        return ContractorProfile(**updated_profile)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

# Escrow System Endpoints
@escrow_router.post("/create", response_model=EscrowStatus)
async def create_escrow(
    escrow_data: EscrowCreate,
    client_wallet: str = Depends(verify_wallet_ownership)
):
    """Create escrow contract for accepted bid"""
    try:
        db = await get_database()
        
        # Verify RFP ownership and bid acceptance
        rfp = await db.rfps.find_one({"id": escrow_data.rfp_id, "creator_wallet": client_wallet})
        if not rfp:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only create escrow for your own RFPs"
            )
        
        # Calculate platform fee
        platform_fee = await calculate_platform_fee(client_wallet)
        
        # Create blockchain escrow contract
        contract_address = await create_escrow_contract(
            client_wallet=client_wallet,
            contractor_wallet=escrow_data.contractor_wallet,
            amount=escrow_data.amount,
            platform_fee=platform_fee
        )
        
        escrow_doc = {
            "id": str(uuid.uuid4()),
            "rfp_id": escrow_data.rfp_id,
            "client_wallet": client_wallet,
            "contractor_wallet": escrow_data.contractor_wallet,
            "amount": escrow_data.amount.dict(),
            "status": "created",
            "milestones": [m.dict() for m in escrow_data.milestones],
            "platform_fee": platform_fee,
            "contract_address": contract_address,
            "created_at": datetime.utcnow()
        }
        
        await db.escrows.insert_one(escrow_doc)
        
        # Update RFP status
        await db.rfps.update_one(
            {"id": escrow_data.rfp_id},
            {"$set": {"status": "in_progress"}}
        )
        
        # Publish event
        await publish_event("escrow_created", {
            "escrow_id": escrow_doc["id"],
            "rfp_id": escrow_data.rfp_id,
            "client": client_wallet,
            "contractor": escrow_data.contractor_wallet
        })
        
        return EscrowStatus(**escrow_doc)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create escrow: {str(e)}"
        )

@escrow_router.get("/status/{escrow_id}", response_model=EscrowStatus)
async def get_escrow_status(
    escrow_id: str,
    requestor_wallet: str = Depends(verify_wallet_ownership)
):
    """Get escrow status"""
    try:
        db = await get_database()
        
        escrow = await db.escrows.find_one({"id": escrow_id})
        if not escrow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Escrow not found"
            )
        
        # Verify access rights
        if requestor_wallet not in [escrow["client_wallet"], escrow["contractor_wallet"]]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return EscrowStatus(**escrow)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch escrow status: {str(e)}"
        )

@escrow_router.post("/release/{escrow_id}")
async def release_escrow_payment(
    escrow_id: str,
    milestone_id: Optional[str] = None,
    client_wallet: str = Depends(verify_wallet_ownership)
):
    """Release escrow payment for completed milestone or project"""
    try:
        db = await get_database()
        
        escrow = await db.escrows.find_one({"id": escrow_id, "client_wallet": client_wallet})
        if not escrow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Escrow not found or access denied"
            )
        
        # Release payment via blockchain
        await release_payment(
            contract_address=escrow["contract_address"],
            milestone_id=milestone_id
        )
        
        # Update escrow status
        update_data = {"status": "completed", "completed_at": datetime.utcnow()}
        if milestone_id:
            # Update specific milestone
            for milestone in escrow["milestones"]:
                if milestone["id"] == milestone_id:
                    milestone["status"] = "approved"
                    break
        
        await db.escrows.update_one(
            {"id": escrow_id},
            {"$set": update_data}
        )
        
        # Update contractor performance metrics
        await update_contractor_metrics(escrow["contractor_wallet"], escrow["rfp_id"])
        
        # Publish event
        await publish_event("payment_released", {
            "escrow_id": escrow_id,
            "milestone_id": milestone_id,
            "contractor": escrow["contractor_wallet"]
        })
        
        return {"status": "success", "message": "Payment released successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to release payment: {str(e)}"
        )

# Helper Functions
async def publish_event(event_type: str, data: Dict[str, Any]):
    """Publish event to WC-BUS system"""
    # Integration with existing WC-BUS
    pass

async def update_contractor_metrics(contractor_wallet: str, rfp_id: str):
    """Update contractor performance metrics after project completion"""
    try:
        db = await get_database()
        
        # Update completed projects count
        await db.contractor_profiles.update_one(
            {"wallet_address": contractor_wallet},
            {"$inc": {"performance_metrics.completed_projects": 1}}
        )
        
        # Additional metrics calculation logic here
        
    except Exception as e:
        print(f"Failed to update contractor metrics: {e}")

# Holder Verification Endpoint
@marketplace_router.get("/verify/holder/{wallet_address}")
async def verify_holder_benefits(wallet_address: str):
    """Verify holder status and benefits"""
    try:
        holder_status = await verify_holder_status(wallet_address)
        
        benefits = {
            "platform_fee": 0.0 if holder_status.get("is_holder", False) else 0.025,
            "rfp_access": ["standard", "premium"] if holder_status.get("is_holder", False) else ["standard"],
            "search_boost": 2.0 if holder_status.get("is_holder", False) else 1.0,
            "features": {
                "advanced_analytics": holder_status.get("is_holder", False),
                "priority_support": holder_status.get("is_holder", False),
                "exclusive_agents": holder_status.get("is_holder", False)
            }
        }
        
        return {
            "is_holder": holder_status.get("is_holder", False),
            "tier": holder_status.get("tier", "standard"),
            "benefits": benefits
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify holder status: {str(e)}"
        )

# Include routers
def setup_marketplace_routes(app):
    app.include_router(marketplace_router)
    app.include_router(contractor_router)
    app.include_router(escrow_router)