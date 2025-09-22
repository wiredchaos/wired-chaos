"""
VAULT33 Gatekeeper - Gamification Logic
"""
import base64
from typing import Optional, Dict, List, Tuple
from loguru import logger
from .config import Config
from .database import db_manager

class GamificationEngine:
    def __init__(self):
        self.config = Config
    
    async def process_wl_claim(self, discord_id: int, tier: str) -> Dict[str, any]:
        """Process whitelist claim"""
        try:
            # Award points and raffle ticket
            points_awarded = self.config.WL_CLAIM_POINTS
            await db_manager.add_points(discord_id, points_awarded, f"WL Claim {tier}")
            await db_manager.add_raffle_tickets(discord_id, 1, f"WL Claim {tier}")
            
            # Update user record
            await db_manager.create_or_update_user(
                discord_id=discord_id,
                update_data={"last_wl_claim": tier}
            )
            
            return {
                "success": True,
                "points_awarded": points_awarded,
                "raffle_tickets": 1,
                "tier": tier,
                "message": f"✅ Whitelist {tier} claimed\nWL Points: +{points_awarded}\nRaffle tickets: +1"
            }
        except Exception as e:
            logger.error(f"❌ WL claim processing error: {e}")
            return {"success": False, "error": str(e)}
    
    async def process_mint(self, discord_id: int, tier: str, token_id: str, tx_hash: str) -> Dict[str, any]:
        """Process mint confirmation"""
        try:
            # Determine points based on tier
            if tier.lower() == "tier1":
                points = self.config.MINT_TIER1_POINTS
                tickets = 1
            elif tier.lower() == "tier2":
                points = self.config.MINT_TIER2_POINTS
                tickets = 2
            else:
                points = self.config.MINT_TIER1_POINTS
                tickets = 1
            
            # Award points and tickets
            await db_manager.add_points(discord_id, points, f"Mint {tier}")
            await db_manager.add_raffle_tickets(discord_id, tickets, f"Mint {tier}")
            
            # Register token
            await db_manager.register_token(token_id, discord_id, {"tier": tier, "mint_tx": tx_hash})
            
            return {
                "success": True,
                "points_awarded": points,
                "raffle_tickets": tickets,
                "token_id": token_id,
                "message": f"🚨 MINT CONFIRMED 🚨\nToken ID: {token_id}\nPoints: +{points}\nRaffle tickets: +{tickets}"
            }
        except Exception as e:
            logger.error(f"❌ Mint processing error: {e}")
            return {"success": False, "error": str(e)}
    
    async def process_burn(self, discord_id: int, token_id: str, tx_hash: str) -> Dict[str, any]:
        """Process burn transaction"""
        try:
            # Get token info
            token = await db_manager.get_token(token_id)
            if not token:
                return {"success": False, "error": "Token not found"}
            
            if token["burn_status"] == "burned":
                return {"success": False, "error": "Token already burned"}
            
            # Mark token as burned
            await db_manager.burn_token(token_id, tx_hash)
            
            # Award base burn points
            base_points = self.config.BURN_BASE_POINTS
            await db_manager.add_points(discord_id, base_points, f"Burn token {token_id}")
            
            # Check for Merovingian recipe match
            fragment_unlocked = await self._check_merovingian_recipe(discord_id, token, tx_hash)
            
            total_points = base_points
            message = f"🔥 Burn registered for token {token_id}\n+{base_points} WL Points"
            
            if fragment_unlocked:
                bonus_points = self.config.BURN_MEROVINGIAN_POINTS
                await db_manager.add_points(discord_id, bonus_points, "Merovingian recipe match")
                total_points += bonus_points
                message += f"\n🧩 MEROVINGIAN FRAGMENT UNLOCKED!\n+{bonus_points} bonus points"
            
            return {
                "success": True,
                "points_awarded": total_points,
                "fragment_unlocked": fragment_unlocked,
                "token_id": token_id,
                "message": message
            }
        except Exception as e:
            logger.error(f"❌ Burn processing error: {e}")
            return {"success": False, "error": str(e)}
    
    async def _check_merovingian_recipe(self, discord_id: int, token: Dict, tx_hash: str) -> Optional[int]:
        """Check if burn matches Merovingian recipe and unlock fragment"""
        try:
            token_metadata = token.get("metadata", {})
            
            # Check each burn recipe
            for recipe_name, recipe_data in self.config.BURN_RECIPES.items():
                if self._matches_recipe(token_metadata, recipe_data):
                    fragment_index = recipe_data["fragment"]
                    
                    # Try to unlock fragment
                    unlocked = await db_manager.unlock_fragment(discord_id, fragment_index, tx_hash)
                    if unlocked:
                        logger.info(f"🧩 Fragment {fragment_index} unlocked for user {discord_id}")
                        return fragment_index
            
            return None
        except Exception as e:
            logger.error(f"❌ Merovingian recipe check error: {e}")
            return None
    
    def _matches_recipe(self, token_metadata: Dict, recipe: Dict) -> bool:
        """Check if token metadata matches burn recipe"""
        # Implement recipe matching logic based on your token structure
        # This is a placeholder implementation
        
        if "trait" in recipe:
            return token_metadata.get("trait") == recipe["trait"]
        elif "descendant" in recipe:
            return token_metadata.get("descendant") == recipe["descendant"]
        elif "layer" in recipe:
            return token_metadata.get("layer") == recipe["layer"]
        elif "alignment" in recipe:
            # Special logic for alignment check
            return True  # Placeholder
        elif "frequency" in recipe:
            return token_metadata.get("frequency") == recipe["frequency"]
        
        return False
    
    async def get_user_status(self, discord_id: int) -> Dict[str, any]:
        """Get user's complete status"""
        try:
            user = await db_manager.get_user(discord_id=discord_id)
            if not user:
                return {
                    "total_points": 0,
                    "raffle_tickets": 0,
                    "fragments_unlocked": [],
                    "roles": []
                }
            
            # Get raffle tickets
            raffle_tickets = await db_manager.get_user_raffle_tickets(discord_id)
            
            # Get fragments
            fragments = await db_manager.get_user_fragments(discord_id)
            
            return {
                "total_points": user.get("total_points", 0),
                "raffle_tickets": raffle_tickets,
                "fragments_unlocked": fragments,
                "roles": user.get("roles", []),
                "fragment_count": len(fragments),
                "sangreal_unlocked": len(fragments) >= 5
            }
        except Exception as e:
            logger.error(f"❌ Get user status error: {e}")
            return {"error": str(e)}
    
    def get_fragment_hint(self, fragment_index: int) -> Optional[str]:
        """Get decoded Merovingian fragment hint"""
        try:
            encoded_fragment = self.config.FRAGMENTS.get(fragment_index)
            if not encoded_fragment:
                return None
            
            # Decode base64
            decoded_bytes = base64.b64decode(encoded_fragment)
            decoded_text = decoded_bytes.decode('utf-8')
            
            return decoded_text
        except Exception as e:
            logger.error(f"❌ Fragment decode error: {e}")
            return None
    
    async def get_next_fragment_hint(self, discord_id: int) -> Optional[Tuple[int, str]]:
        """Get next available fragment hint for user"""
        try:
            user_fragments = await db_manager.get_user_fragments(discord_id)
            
            # Find next fragment to unlock (1-5)
            for i in range(1, 6):
                if i not in user_fragments:
                    hint = self.get_fragment_hint(i)
                    if hint:
                        return (i, hint)
            
            return None
        except Exception as e:
            logger.error(f"❌ Get next fragment hint error: {e}")
            return None

# Global gamification engine
gamification = GamificationEngine()