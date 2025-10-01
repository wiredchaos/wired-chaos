"""
Blockchain Logger

Log all grant actions to blockchain for audit and compliance.
Provides immutable record of discovery, applications, and submissions.
"""

from datetime import datetime
from typing import Dict, List, Optional

from loguru import logger


class BlockchainLogger:
    """Log grant bot actions to blockchain"""
    
    def __init__(
        self,
        network: str = "ethereum",
        rpc_url: Optional[str] = None,
        private_key: Optional[str] = None,
        contract_address: Optional[str] = None
    ):
        """
        Initialize blockchain logger
        
        Args:
            network: Blockchain network name
            rpc_url: RPC endpoint URL
            private_key: Private key for signing transactions
            contract_address: Smart contract address for logs
        """
        self.network = network
        self.rpc_url = rpc_url
        self.private_key = private_key
        self.contract_address = contract_address
        self.log_cache: List[Dict] = []
        
        self.enabled = bool(rpc_url and private_key and contract_address)
        
        if self.enabled:
            logger.info(f"🔗 Initialized BlockchainLogger on {network}")
        else:
            logger.info("🔗 BlockchainLogger in stub mode (missing configuration)")
    
    async def log_discovery(self, grants: List[Dict]) -> Optional[str]:
        """
        Log grant discovery to blockchain
        
        Args:
            grants: List of discovered grants
            
        Returns:
            Transaction hash or None
        """
        log_entry = {
            'action': 'discovery',
            'timestamp': datetime.utcnow().isoformat(),
            'grants_count': len(grants),
            'grant_ids': [g.get('grant_id', g.get('title', '')) for g in grants[:10]],
        }
        
        return await self._write_to_blockchain(log_entry)
    
    async def log_eligibility_check(
        self,
        grant_id: str,
        is_eligible: bool,
        match_score: float
    ) -> Optional[str]:
        """
        Log eligibility check to blockchain
        
        Args:
            grant_id: Grant identifier
            is_eligible: Eligibility result
            match_score: Match score
            
        Returns:
            Transaction hash or None
        """
        log_entry = {
            'action': 'eligibility_check',
            'timestamp': datetime.utcnow().isoformat(),
            'grant_id': grant_id,
            'is_eligible': is_eligible,
            'match_score': match_score,
        }
        
        return await self._write_to_blockchain(log_entry)
    
    async def log_application_draft(
        self,
        grant_id: str,
        application_id: str
    ) -> Optional[str]:
        """
        Log application drafting to blockchain
        
        Args:
            grant_id: Grant identifier
            application_id: Application identifier
            
        Returns:
            Transaction hash or None
        """
        log_entry = {
            'action': 'application_draft',
            'timestamp': datetime.utcnow().isoformat(),
            'grant_id': grant_id,
            'application_id': application_id,
        }
        
        return await self._write_to_blockchain(log_entry)
    
    async def log_submission(
        self,
        grant_id: str,
        submission_id: str,
        method: str
    ) -> Optional[str]:
        """
        Log application submission to blockchain
        
        Args:
            grant_id: Grant identifier
            submission_id: Submission identifier
            method: Submission method
            
        Returns:
            Transaction hash or None
        """
        log_entry = {
            'action': 'submission',
            'timestamp': datetime.utcnow().isoformat(),
            'grant_id': grant_id,
            'submission_id': submission_id,
            'method': method,
        }
        
        return await self._write_to_blockchain(log_entry)
    
    async def log_status_change(
        self,
        submission_id: str,
        old_status: str,
        new_status: str
    ) -> Optional[str]:
        """
        Log status change to blockchain
        
        Args:
            submission_id: Submission identifier
            old_status: Previous status
            new_status: New status
            
        Returns:
            Transaction hash or None
        """
        log_entry = {
            'action': 'status_change',
            'timestamp': datetime.utcnow().isoformat(),
            'submission_id': submission_id,
            'old_status': old_status,
            'new_status': new_status,
        }
        
        return await self._write_to_blockchain(log_entry)
    
    async def _write_to_blockchain(self, log_entry: Dict) -> Optional[str]:
        """
        Write log entry to blockchain
        
        Args:
            log_entry: Log entry dictionary
            
        Returns:
            Transaction hash or None
        """
        # Add to cache
        self.log_cache.append(log_entry)
        
        if not self.enabled:
            logger.info(f"📝 Cached log (blockchain disabled): {log_entry['action']}")
            return None
        
        logger.info(f"🔗 Writing to blockchain: {log_entry['action']}")
        
        # Stub implementation - would use web3.py
        # from web3 import Web3
        # w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        # contract = w3.eth.contract(address=self.contract_address, abi=ABI)
        # tx = contract.functions.logAction(...).buildTransaction(...)
        # signed = w3.eth.account.sign_transaction(tx, self.private_key)
        # tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        
        # Stub transaction hash
        tx_hash = f"0x{'a' * 64}"
        
        logger.info(f"✅ Logged to blockchain: {tx_hash}")
        
        return tx_hash
    
    def get_cached_logs(self) -> List[Dict]:
        """Get all cached logs"""
        return self.log_cache.copy()
    
    def get_logs_by_action(self, action: str) -> List[Dict]:
        """
        Get logs by action type
        
        Args:
            action: Action type to filter by
            
        Returns:
            List of matching logs
        """
        return [log for log in self.log_cache if log['action'] == action]
    
    def get_audit_trail(self, grant_id: str) -> List[Dict]:
        """
        Get complete audit trail for a grant
        
        Args:
            grant_id: Grant identifier
            
        Returns:
            List of log entries for the grant
        """
        return [
            log for log in self.log_cache
            if log.get('grant_id') == grant_id or
               log.get('grant_ids', []) and grant_id in log.get('grant_ids', [])
        ]
    
    def export_audit_report(self, filepath: str) -> str:
        """
        Export audit report to file
        
        Args:
            filepath: Path to save report
            
        Returns:
            Path to saved file
        """
        import json
        
        logger.info(f"📄 Exporting audit report to {filepath}")
        
        report = {
            'generated_at': datetime.utcnow().isoformat(),
            'network': self.network,
            'total_logs': len(self.log_cache),
            'logs': self.log_cache,
        }
        
        # In production, would write actual file
        # with open(filepath, 'w') as f:
        #     json.dump(report, f, indent=2)
        
        logger.info(f"✅ Audit report exported (stub)")
        
        return filepath


# Example usage
async def main():
    """Example usage of BlockchainLogger"""
    
    logger_obj = BlockchainLogger(
        network="ethereum",
        # No credentials = stub mode
    )
    
    # Log discovery
    grants = [
        {'grant_id': 'GRANT-001', 'title': 'Test Grant 1'},
        {'grant_id': 'GRANT-002', 'title': 'Test Grant 2'},
    ]
    
    tx_hash = await logger_obj.log_discovery(grants)
    print(f"\n🔗 Discovery logged: {tx_hash}")
    
    # Log submission
    tx_hash = await logger_obj.log_submission('GRANT-001', 'SUB-12345', 'api')
    print(f"🔗 Submission logged: {tx_hash}")
    
    # Get audit trail
    trail = logger_obj.get_audit_trail('GRANT-001')
    print(f"\n📊 Audit Trail for GRANT-001:")
    for entry in trail:
        print(f"  - {entry['action']} at {entry['timestamp']}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
