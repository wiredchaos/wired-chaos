from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        
    async def connect(self):
        """Initialize database connection"""
        try:
            mongodb_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
            db_name = os.getenv('MONGODB_DB', 'marketplace')
            
            self.client = AsyncIOMotorClient(mongodb_url)
            self.db = self.client[db_name]
            
            # Test connection
            await self.client.admin.command('ping')
            logger.info(f"Connected to MongoDB: {db_name}")
            
            # Create indexes
            await self._create_indexes()
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    async def disconnect(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")
    
    async def _create_indexes(self):
        """Create database indexes for optimal performance"""
        try:
            # RFPs collection indexes
            await self.db.rfps.create_index([("status", ASCENDING)])
            await self.db.rfps.create_index([("creator_wallet", ASCENDING)])
            await self.db.rfps.create_index([("holder_only", ASCENDING)])
            await self.db.rfps.create_index([("required_skills", ASCENDING)])
            await self.db.rfps.create_index([("created_at", DESCENDING)])
            await self.db.rfps.create_index([("deadline", ASCENDING)])
            
            # Bids collection indexes
            await self.db.bids.create_index([("rfp_id", ASCENDING)])
            await self.db.bids.create_index([("contractor_wallet", ASCENDING)])
            await self.db.bids.create_index([("status", ASCENDING)])
            await self.db.bids.create_index([("submitted_at", DESCENDING)])
            await self.db.bids.create_index([
                ("rfp_id", ASCENDING), 
                ("contractor_wallet", ASCENDING)
            ], unique=True)  # Prevent duplicate bids
            
            # Contractor profiles indexes
            await self.db.contractor_profiles.create_index([("wallet_address", ASCENDING)], unique=True)
            await self.db.contractor_profiles.create_index([("skills", ASCENDING)])
            await self.db.contractor_profiles.create_index([("performance_metrics.completed_projects", DESCENDING)])
            await self.db.contractor_profiles.create_index([("performance_metrics.average_rating", DESCENDING)])
            
            # Escrows collection indexes
            await self.db.escrows.create_index([("rfp_id", ASCENDING)])
            await self.db.escrows.create_index([("client_wallet", ASCENDING)])
            await self.db.escrows.create_index([("contractor_wallet", ASCENDING)])
            await self.db.escrows.create_index([("status", ASCENDING)])
            await self.db.escrows.create_index([("created_at", DESCENDING)])
            
            # Reviews collection indexes
            await self.db.reviews.create_index([("contractor_wallet", ASCENDING)])
            await self.db.reviews.create_index([("client_wallet", ASCENDING)])
            await self.db.reviews.create_index([("rfp_id", ASCENDING)])
            await self.db.reviews.create_index([("created_at", DESCENDING)])
            
            # Holder verification cache indexes
            await self.db.holder_cache.create_index([("wallet_address", ASCENDING)], unique=True)
            await self.db.holder_cache.create_index([("expires_at", ASCENDING)])
            
            logger.info("Database indexes created successfully")
            
        except Exception as e:
            logger.error(f"Failed to create indexes: {e}")
            raise

# Database connection instance
db_manager = DatabaseManager()

async def get_database():
    """Get database instance"""
    return db_manager.db

async def init_database():
    """Initialize database connection"""
    await db_manager.connect()

async def close_database():
    """Close database connection"""
    await db_manager.disconnect()

# Helper functions for common database operations
async def create_rfp(rfp_data: dict) -> dict:
    """Create a new RFP document"""
    db = await get_database()
    rfp_data["created_at"] = datetime.utcnow()
    rfp_data["updated_at"] = datetime.utcnow()
    
    result = await db.rfps.insert_one(rfp_data)
    rfp_data["_id"] = result.inserted_id
    return rfp_data

async def get_rfps(query_filter: dict = None, limit: int = 100) -> list:
    """Get RFPs with optional filtering"""
    db = await get_database()
    filter_query = query_filter or {}
    
    cursor = db.rfps.find(filter_query).sort("created_at", DESCENDING).limit(limit)
    return await cursor.to_list(length=limit)

async def update_rfp(rfp_id: str, update_data: dict) -> bool:
    """Update RFP document"""
    db = await get_database()
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.rfps.update_one(
        {"id": rfp_id},
        {"$set": update_data}
    )
    return result.modified_count > 0

async def create_bid(bid_data: dict) -> dict:
    """Create a new bid document"""
    db = await get_database()
    bid_data["submitted_at"] = datetime.utcnow()
    
    result = await db.bids.insert_one(bid_data)
    bid_data["_id"] = result.inserted_id
    return bid_data

async def get_bids(rfp_id: str = None, contractor_wallet: str = None) -> list:
    """Get bids with optional filtering"""
    db = await get_database()
    filter_query = {}
    
    if rfp_id:
        filter_query["rfp_id"] = rfp_id
    if contractor_wallet:
        filter_query["contractor_wallet"] = contractor_wallet
    
    cursor = db.bids.find(filter_query).sort("submitted_at", DESCENDING)
    return await cursor.to_list(length=None)

async def update_bid_status(bid_id: str, status: str) -> bool:
    """Update bid status"""
    db = await get_database()
    
    result = await db.bids.update_one(
        {"id": bid_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count > 0

async def get_contractor_profile(wallet_address: str) -> dict:
    """Get contractor profile by wallet address"""
    db = await get_database()
    
    profile = await db.contractor_profiles.find_one({"wallet_address": wallet_address})
    return profile

async def update_contractor_profile(wallet_address: str, profile_data: dict) -> bool:
    """Update contractor profile"""
    db = await get_database()
    profile_data["updated_at"] = datetime.utcnow()
    
    result = await db.contractor_profiles.update_one(
        {"wallet_address": wallet_address},
        {"$set": profile_data},
        upsert=True
    )
    return result.modified_count > 0 or result.upserted_id is not None

async def create_escrow(escrow_data: dict) -> dict:
    """Create a new escrow document"""
    db = await get_database()
    escrow_data["created_at"] = datetime.utcnow()
    escrow_data["updated_at"] = datetime.utcnow()
    
    result = await db.escrows.insert_one(escrow_data)
    escrow_data["_id"] = result.inserted_id
    return escrow_data

async def get_escrows(wallet_address: str = None, status: str = None) -> list:
    """Get escrows with optional filtering"""
    db = await get_database()
    filter_query = {}
    
    if wallet_address:
        filter_query["$or"] = [
            {"client_wallet": wallet_address},
            {"contractor_wallet": wallet_address}
        ]
    if status:
        filter_query["status"] = status
    
    cursor = db.escrows.find(filter_query).sort("created_at", DESCENDING)
    return await cursor.to_list(length=None)

async def update_escrow_status(escrow_id: str, status: str, additional_data: dict = None) -> bool:
    """Update escrow status"""
    db = await get_database()
    
    update_data = {
        "status": status,
        "updated_at": datetime.utcnow()
    }
    
    if additional_data:
        update_data.update(additional_data)
    
    result = await db.escrows.update_one(
        {"id": escrow_id},
        {"$set": update_data}
    )
    return result.modified_count > 0

async def cache_holder_status(wallet_address: str, holder_data: dict, ttl_minutes: int = 30):
    """Cache holder verification status"""
    db = await get_database()
    
    cache_data = {
        "wallet_address": wallet_address,
        "holder_data": holder_data,
        "expires_at": datetime.utcnow().timestamp() + (ttl_minutes * 60),
        "updated_at": datetime.utcnow()
    }
    
    await db.holder_cache.update_one(
        {"wallet_address": wallet_address},
        {"$set": cache_data},
        upsert=True
    )

async def get_cached_holder_status(wallet_address: str) -> dict:
    """Get cached holder verification status"""
    db = await get_database()
    
    cache_entry = await db.holder_cache.find_one({
        "wallet_address": wallet_address,
        "expires_at": {"$gt": datetime.utcnow().timestamp()}
    })
    
    return cache_entry["holder_data"] if cache_entry else None

async def create_review(review_data: dict) -> dict:
    """Create a new review document"""
    db = await get_database()
    review_data["created_at"] = datetime.utcnow()
    
    result = await db.reviews.insert_one(review_data)
    review_data["_id"] = result.inserted_id
    return review_data

async def get_contractor_reviews(contractor_wallet: str, limit: int = 20) -> list:
    """Get reviews for a contractor"""
    db = await get_database()
    
    cursor = db.reviews.find({"contractor_wallet": contractor_wallet}).sort("created_at", DESCENDING).limit(limit)
    return await cursor.to_list(length=limit)

async def update_contractor_metrics(contractor_wallet: str, metrics_update: dict) -> bool:
    """Update contractor performance metrics"""
    db = await get_database()
    
    result = await db.contractor_profiles.update_one(
        {"wallet_address": contractor_wallet},
        {"$set": {"performance_metrics": metrics_update, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count > 0

# Database health check
async def health_check() -> dict:
    """Check database health"""
    try:
        db = await get_database()
        
        # Test basic operations
        await db.command("ping")
        
        # Get collection stats
        rfp_count = await db.rfps.count_documents({})
        bid_count = await db.bids.count_documents({})
        profile_count = await db.contractor_profiles.count_documents({})
        escrow_count = await db.escrows.count_documents({})
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "collections": {
                "rfps": rfp_count,
                "bids": bid_count,
                "profiles": profile_count,
                "escrows": escrow_count
            }
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }