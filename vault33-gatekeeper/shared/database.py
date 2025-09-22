"""
VAULT33 Gatekeeper - MongoDB Database Operations
"""
import asyncio
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from loguru import logger
from .config import Config

class DatabaseManager:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
    
    async def connect(self):
        """Initialize MongoDB connection"""
        try:
            self.client = AsyncIOMotorClient(Config.MONGO_URL)
            self.db = self.client[Config.MONGO_DB_NAME]
            
            # Test connection
            await self.client.admin.command('ping')
            logger.info(f"📊 Connected to MongoDB: {Config.MONGO_DB_NAME}")
            
            # Create indexes
            await self._create_indexes()
        except Exception as e:
            logger.error(f"❌ MongoDB connection failed: {e}")
            raise
    
    async def _create_indexes(self):
        """Create database indexes for performance"""
        try:
            # Users collection indexes
            await self.db.users.create_index("discord_id", unique=True, sparse=True)
            await self.db.users.create_index("telegram_id", unique=True, sparse=True)
            
            # Tokens collection indexes
            await self.db.tokens.create_index("token_id", unique=True)
            await self.db.tokens.create_index("owner_discord_id")
            
            # Tickets collection indexes
            await self.db.tickets.create_index("user_discord_id")
            await self.db.tickets.create_index("created_at")
            
            # Fragments collection indexes
            await self.db.fragments.create_index([("user_discord_id", 1), ("fragment_index", 1)], unique=True)
            
            # Actions collection indexes
            await self.db.actions.create_index("user_discord_id")
            await self.db.actions.create_index("created_at")
            
            logger.info("📊 MongoDB indexes created successfully")
        except Exception as e:
            logger.warning(f"⚠️ Index creation warning: {e}")
    
    async def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("📊 MongoDB connection closed")
    
    # User Operations
    async def get_user(self, discord_id: Optional[int] = None, telegram_id: Optional[int] = None) -> Optional[Dict]:
        """Get user by Discord or Telegram ID"""
        query = {}
        if discord_id:
            query["discord_id"] = discord_id
        elif telegram_id:
            query["telegram_id"] = telegram_id
        else:
            return None
        
        return await self.db.users.find_one(query)
    
    async def create_or_update_user(self, discord_id: Optional[int] = None, 
                                   telegram_id: Optional[int] = None,
                                   update_data: Optional[Dict] = None) -> Dict:
        """Create or update user record"""
        query = {}
        if discord_id:
            query["discord_id"] = discord_id
        elif telegram_id:
            query["telegram_id"] = telegram_id
        
        update_doc = {
            "updated_at": datetime.now(timezone.utc),
            **(update_data or {})
        }
        
        # Set default values for new users
        set_on_insert = {
            "total_points": 0,
            "roles": [],
            "created_at": datetime.now(timezone.utc)
        }
        if discord_id:
            set_on_insert["discord_id"] = discord_id
        if telegram_id:
            set_on_insert["telegram_id"] = telegram_id
        
        result = await self.db.users.find_one_and_update(
            query,
            {
                "$set": update_doc,
                "$setOnInsert": set_on_insert
            },
            upsert=True,
            return_document=True
        )
        return result
    
    async def add_points(self, discord_id: int, points: int, reason: str) -> bool:
        """Add points to user account"""
        try:
            # Update user points
            await self.db.users.update_one(
                {"discord_id": discord_id},
                {
                    "$inc": {"total_points": points},
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                },
                upsert=True
            )
            
            # Log action
            await self.log_action(discord_id, "points_added", points, {"reason": reason})
            
            logger.info(f"💎 Added {points} points to user {discord_id} for: {reason}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to add points: {e}")
            return False
    
    # Raffle Ticket Operations
    async def add_raffle_tickets(self, discord_id: int, amount: int, reason: str) -> bool:
        """Add raffle tickets to user"""
        try:
            ticket_doc = {
                "user_discord_id": discord_id,
                "amount": amount,
                "reason": reason,
                "created_at": datetime.now(timezone.utc)
            }
            
            await self.db.tickets.insert_one(ticket_doc)
            await self.log_action(discord_id, "raffle_tickets_added", amount, {"reason": reason})
            
            logger.info(f"🎫 Added {amount} raffle tickets to user {discord_id} for: {reason}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to add raffle tickets: {e}")
            return False
    
    async def get_user_raffle_tickets(self, discord_id: int) -> int:
        """Get total raffle tickets for user"""
        pipeline = [
            {"$match": {"user_discord_id": discord_id}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        
        result = await self.db.tickets.aggregate(pipeline).to_list(1)
        return result[0]["total"] if result else 0
    
    # Fragment Operations
    async def unlock_fragment(self, discord_id: int, fragment_index: int, proof_tx: str) -> bool:
        """Unlock Merovingian fragment for user"""
        try:
            fragment_doc = {
                "user_discord_id": discord_id,
                "fragment_index": fragment_index,
                "proof_tx": proof_tx,
                "unlocked_at": datetime.now(timezone.utc)
            }
            
            await self.db.fragments.insert_one(fragment_doc)
            await self.log_action(discord_id, "fragment_unlocked", fragment_index, {"proof_tx": proof_tx})
            
            logger.info(f"🧩 Fragment {fragment_index} unlocked for user {discord_id}")
            return True
        except Exception as e:
            if "duplicate key" in str(e).lower():
                logger.warning(f"⚠️ Fragment {fragment_index} already unlocked for user {discord_id}")
                return False
            logger.error(f"❌ Failed to unlock fragment: {e}")
            return False
    
    async def get_user_fragments(self, discord_id: int) -> List[int]:
        """Get list of unlocked fragment indexes for user"""
        fragments = await self.db.fragments.find(
            {"user_discord_id": discord_id},
            {"fragment_index": 1}
        ).sort("fragment_index", 1).to_list(None)
        
        return [f["fragment_index"] for f in fragments]
    
    # Token Operations
    async def register_token(self, token_id: str, owner_discord_id: int, metadata: Optional[Dict] = None) -> bool:
        """Register a new token"""
        try:
            token_doc = {
                "token_id": token_id,
                "owner_discord_id": owner_discord_id,
                "burn_status": "active",
                "metadata": metadata or {},
                "created_at": datetime.now(timezone.utc)
            }
            
            await self.db.tokens.insert_one(token_doc)
            logger.info(f"🏷️ Token {token_id} registered for user {owner_discord_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to register token: {e}")
            return False
    
    async def burn_token(self, token_id: str, burn_tx: str) -> bool:
        """Mark token as burned"""
        try:
            result = await self.db.tokens.update_one(
                {"token_id": token_id, "burn_status": "active"},
                {
                    "$set": {
                        "burn_status": "burned",
                        "burn_tx": burn_tx,
                        "burned_at": datetime.now(timezone.utc)
                    }
                }
            )
            
            if result.modified_count > 0:
                logger.info(f"🔥 Token {token_id} marked as burned")
                return True
            else:
                logger.warning(f"⚠️ Token {token_id} not found or already burned")
                return False
        except Exception as e:
            logger.error(f"❌ Failed to burn token: {e}")
            return False
    
    async def get_token(self, token_id: str) -> Optional[Dict]:
        """Get token information"""
        return await self.db.tokens.find_one({"token_id": token_id})
    
    # Action Logging
    async def log_action(self, discord_id: int, action: str, amount: int, metadata: Optional[Dict] = None):
        """Log user action for audit trail"""
        try:
            action_doc = {
                "user_discord_id": discord_id,
                "action": action,
                "amount": amount,
                "metadata": metadata or {},
                "created_at": datetime.now(timezone.utc)
            }
            
            await self.db.actions.insert_one(action_doc)
        except Exception as e:
            logger.error(f"❌ Failed to log action: {e}")

# Global database instance
db_manager = DatabaseManager()