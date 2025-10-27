"""
XRPL Game Client - XRP Ledger integration for VRG33589
Handles NFT operations, credit distribution, and DEX interactions
"""
import os
import asyncio
import logging
from typing import Dict, Any, Optional, List
import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class XRPLGameClient:
    """Client for XRPL game operations"""
    
    def __init__(self):
        self.rpc_url = os.getenv("XRPL_RPC_URL", "https://s.altnet.rippletest.net:51234")
        self.network = os.getenv("XRPL_NETWORK", "testnet")
        self.game_wallet = os.getenv("XRPL_GAME_WALLET", "")
        
    async def validate_nft_ownership(self, wallet_address: str, nft_id: str) -> Dict[str, Any]:
        """Validate that a wallet owns a specific NFT"""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                payload = {
                    "method": "account_nfts",
                    "params": [{
                        "account": wallet_address,
                        "ledger_index": "validated"
                    }]
                }
                
                response = await client.post(self.rpc_url, json=payload)
                data = response.json()
                
                if "result" not in data or "account_nfts" not in data["result"]:
                    return {
                        "valid": False,
                        "error": "Failed to fetch account NFTs"
                    }
                
                # Check if NFT exists in account
                nfts = data["result"]["account_nfts"]
                for nft in nfts:
                    if nft.get("NFTokenID") == nft_id:
                        return {
                            "valid": True,
                            "nft_id": nft_id,
                            "owner": wallet_address,
                            "uri": nft.get("URI", ""),
                            "taxon": nft.get("NFTokenTaxon", 0),
                            "flags": nft.get("Flags", 0)
                        }
                
                return {
                    "valid": False,
                    "error": "NFT not found in wallet"
                }
                
        except Exception as e:
            logger.error(f"Error validating NFT ownership: {e}")
            return {
                "valid": False,
                "error": str(e)
            }
    
    async def get_wallet_balance(self, wallet_address: str) -> Dict[str, Any]:
        """Get XRP balance for a wallet"""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                payload = {
                    "method": "account_info",
                    "params": [{
                        "account": wallet_address,
                        "ledger_index": "validated"
                    }]
                }
                
                response = await client.post(self.rpc_url, json=payload)
                data = response.json()
                
                if "result" not in data or "account_data" not in data["result"]:
                    return {
                        "success": False,
                        "error": "Failed to fetch account info"
                    }
                
                balance_drops = int(data["result"]["account_data"]["Balance"])
                balance_xrp = balance_drops / 1_000_000
                
                return {
                    "success": True,
                    "wallet": wallet_address,
                    "balance_xrp": balance_xrp,
                    "balance_drops": balance_drops
                }
                
        except Exception as e:
            logger.error(f"Error fetching wallet balance: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_nft_metadata(self, nft_id: str) -> Dict[str, Any]:
        """Get metadata for a specific NFT"""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                payload = {
                    "method": "nft_info",
                    "params": [{
                        "nft_id": nft_id,
                        "ledger_index": "validated"
                    }]
                }
                
                response = await client.post(self.rpc_url, json=payload)
                data = response.json()
                
                if "result" not in data:
                    return {
                        "success": False,
                        "error": "NFT not found"
                    }
                
                result = data["result"]
                
                return {
                    "success": True,
                    "nft_id": nft_id,
                    "owner": result.get("owner", ""),
                    "issuer": result.get("issuer", ""),
                    "uri": result.get("uri", ""),
                    "flags": result.get("flags", 0)
                }
                
        except Exception as e:
            logger.error(f"Error fetching NFT metadata: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def verify_transaction(self, tx_hash: str) -> Dict[str, Any]:
        """Verify a transaction on XRPL"""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                payload = {
                    "method": "tx",
                    "params": [{
                        "transaction": tx_hash,
                        "binary": False
                    }]
                }
                
                response = await client.post(self.rpc_url, json=payload)
                data = response.json()
                
                if "result" not in data:
                    return {
                        "verified": False,
                        "error": "Transaction not found"
                    }
                
                result = data["result"]
                
                return {
                    "verified": True,
                    "tx_hash": tx_hash,
                    "status": result.get("meta", {}).get("TransactionResult", ""),
                    "transaction_type": result.get("TransactionType", ""),
                    "account": result.get("Account", ""),
                    "validated": result.get("validated", False)
                }
                
        except Exception as e:
            logger.error(f"Error verifying transaction: {e}")
            return {
                "verified": False,
                "error": str(e)
            }
    
    async def get_dex_offers(self, nft_id: str) -> Dict[str, Any]:
        """Get DEX offers for an NFT"""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                payload = {
                    "method": "nft_sell_offers",
                    "params": [{
                        "nft_id": nft_id,
                        "ledger_index": "validated"
                    }]
                }
                
                response = await client.post(self.rpc_url, json=payload)
                data = response.json()
                
                if "result" not in data:
                    return {
                        "success": True,
                        "offers": [],
                        "count": 0
                    }
                
                offers = data["result"].get("offers", [])
                
                return {
                    "success": True,
                    "nft_id": nft_id,
                    "offers": offers,
                    "count": len(offers)
                }
                
        except Exception as e:
            logger.error(f"Error fetching DEX offers: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def calculate_nft_rarity(self, nft_data: Dict[str, Any]) -> str:
        """Calculate NFT rarity based on metadata"""
        # Simple rarity calculation based on taxon
        taxon = nft_data.get("taxon", 0)
        
        if taxon >= 9000:
            return "legendary"
        elif taxon >= 7000:
            return "epic"
        elif taxon >= 5000:
            return "rare"
        else:
            return "common"
    
    def calculate_daily_credits(self, rarity: str) -> float:
        """Calculate daily credit generation for NFT"""
        credit_rates = {
            "common": 1.0,
            "rare": 2.5,
            "epic": 5.0,
            "legendary": 10.0
        }
        return credit_rates.get(rarity, 1.0)

# Global client instance
xrpl_game_client = XRPLGameClient()

# Helper functions for easy import
async def validate_player_nft(wallet: str, nft_id: str) -> Dict[str, Any]:
    """Validate NFT ownership for game"""
    return await xrpl_game_client.validate_nft_ownership(wallet, nft_id)

async def get_player_balance(wallet: str) -> Dict[str, Any]:
    """Get player XRP balance"""
    return await xrpl_game_client.get_wallet_balance(wallet)

async def verify_game_transaction(tx_hash: str) -> Dict[str, Any]:
    """Verify game transaction"""
    return await xrpl_game_client.verify_transaction(tx_hash)
