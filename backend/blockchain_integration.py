import asyncio
from typing import Dict, Any
import hashlib
import json
from datetime import datetime

# Blockchain integration for escrow smart contracts
# This is a simplified implementation for the marketplace system

class BlockchainIntegration:
    def __init__(self):
        self.contracts = {}
        self.transactions = {}
    
    async def create_escrow_contract(
        self, 
        client_wallet: str, 
        contractor_wallet: str, 
        amount: dict, 
        platform_fee: float
    ) -> str:
        """Create escrow smart contract"""
        
        # Generate unique contract address
        contract_data = f"{client_wallet}-{contractor_wallet}-{amount['amount']}-{datetime.utcnow().isoformat()}"
        contract_address = hashlib.sha256(contract_data.encode()).hexdigest()[:40]
        contract_address = f"0x{contract_address}"
        
        # Store contract details
        self.contracts[contract_address] = {
            "client_wallet": client_wallet,
            "contractor_wallet": contractor_wallet,
            "amount": amount,
            "platform_fee": platform_fee,
            "status": "created",
            "created_at": datetime.utcnow().isoformat(),
            "milestones": []
        }
        
        return contract_address
    
    async def fund_escrow(self, contract_address: str) -> bool:
        """Fund the escrow contract"""
        if contract_address in self.contracts:
            self.contracts[contract_address]["status"] = "funded"
            self.contracts[contract_address]["funded_at"] = datetime.utcnow().isoformat()
            return True
        return False
    
    async def release_payment(self, contract_address: str, milestone_id: str = None) -> bool:
        """Release payment from escrow"""
        if contract_address not in self.contracts:
            return False
        
        contract = self.contracts[contract_address]
        
        # Generate transaction hash
        tx_data = f"{contract_address}-{milestone_id or 'full'}-{datetime.utcnow().isoformat()}"
        tx_hash = hashlib.sha256(tx_data.encode()).hexdigest()
        
        # Record transaction
        self.transactions[tx_hash] = {
            "contract_address": contract_address,
            "milestone_id": milestone_id,
            "amount": contract["amount"],
            "from": contract["client_wallet"],
            "to": contract["contractor_wallet"],
            "platform_fee": contract["platform_fee"],
            "timestamp": datetime.utcnow().isoformat(),
            "status": "completed"
        }
        
        # Update contract status
        if milestone_id:
            # Partial release for milestone
            contract["status"] = "partially_released"
        else:
            # Full release
            contract["status"] = "completed"
            contract["completed_at"] = datetime.utcnow().isoformat()
        
        return True
    
    async def dispute_escrow(self, contract_address: str, reason: str) -> bool:
        """Initiate dispute process"""
        if contract_address in self.contracts:
            self.contracts[contract_address]["status"] = "disputed"
            self.contracts[contract_address]["dispute_reason"] = reason
            self.contracts[contract_address]["disputed_at"] = datetime.utcnow().isoformat()
            return True
        return False
    
    async def get_contract_status(self, contract_address: str) -> Dict[str, Any]:
        """Get contract status and details"""
        return self.contracts.get(contract_address, {})
    
    async def get_transaction_history(self, wallet_address: str) -> list:
        """Get transaction history for a wallet"""
        transactions = []
        for tx_hash, tx_data in self.transactions.items():
            if tx_data["from"] == wallet_address or tx_data["to"] == wallet_address:
                transactions.append({
                    "hash": tx_hash,
                    **tx_data
                })
        return sorted(transactions, key=lambda x: x["timestamp"], reverse=True)

# Global blockchain integration instance
blockchain = BlockchainIntegration()

# Export functions for use in marketplace API
async def create_escrow_contract(client_wallet: str, contractor_wallet: str, amount: dict, platform_fee: float) -> str:
    """Create escrow smart contract"""
    return await blockchain.create_escrow_contract(client_wallet, contractor_wallet, amount, platform_fee)

async def fund_escrow(contract_address: str) -> bool:
    """Fund the escrow contract"""
    return await blockchain.fund_escrow(contract_address)

async def release_payment(contract_address: str, milestone_id: str = None) -> bool:
    """Release payment from escrow"""
    return await blockchain.release_payment(contract_address, milestone_id)

async def dispute_escrow(contract_address: str, reason: str) -> bool:
    """Initiate dispute process"""
    return await blockchain.dispute_escrow(contract_address, reason)

async def get_contract_status(contract_address: str) -> Dict[str, Any]:
    """Get contract status and details"""
    return await blockchain.get_contract_status(contract_address)

async def get_transaction_history(wallet_address: str) -> list:
    """Get transaction history for a wallet"""
    return await blockchain.get_transaction_history(wallet_address)

# Multi-chain support functions
SUPPORTED_CHAINS = {
    "ETH": {
        "name": "Ethereum",
        "decimals": 18,
        "gas_limit": 21000,
        "confirmation_blocks": 12
    },
    "SOL": {
        "name": "Solana",
        "decimals": 9,
        "gas_limit": 200000,
        "confirmation_blocks": 32
    },
    "XRP": {
        "name": "XRP Ledger",
        "decimals": 6,
        "gas_limit": 10,
        "confirmation_blocks": 3
    },
    "HBAR": {
        "name": "Hedera",
        "decimals": 8,
        "gas_limit": 100000,
        "confirmation_blocks": 1
    },
    "DOGE": {
        "name": "Dogecoin",
        "decimals": 8,
        "gas_limit": 25000,
        "confirmation_blocks": 6
    }
}

async def validate_chain_support(currency: str) -> bool:
    """Validate if chain is supported"""
    return currency in SUPPORTED_CHAINS

async def get_chain_info(currency: str) -> Dict[str, Any]:
    """Get chain information"""
    return SUPPORTED_CHAINS.get(currency, {})

async def estimate_gas_fee(currency: str, amount: float) -> Dict[str, Any]:
    """Estimate gas fee for transaction"""
    chain_info = await get_chain_info(currency)
    if not chain_info:
        return {"error": "Unsupported chain"}
    
    # Simplified gas estimation
    base_fee = {
        "ETH": 0.001,
        "SOL": 0.00025,
        "XRP": 0.00001,
        "HBAR": 0.0001,
        "DOGE": 0.001
    }.get(currency, 0.001)
    
    return {
        "currency": currency,
        "base_fee": base_fee,
        "estimated_fee": base_fee * (1 + amount * 0.0001),  # Dynamic fee based on amount
        "confirmation_time": f"{chain_info.get('confirmation_blocks', 1)} blocks"
    }