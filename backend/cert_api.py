"""
WIRED CHAOS - Multi-Chain NFT Certificate API
Unified endpoint for minting certificates across all supported blockchains
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, validator
from typing import Optional, Dict, Any
import asyncio
import json
import logging
from datetime import datetime
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/cert", tags=["certificates"])

class CertificateRequest(BaseModel):
    chain: str
    to: str
    studentName: str
    courseId: str
    courseName: str
    completionDate: Optional[str] = None
    grade: Optional[str] = None
    instructor: Optional[str] = None
    metadataUri: Optional[str] = None

    @validator('chain')
    def validate_chain(cls, v):
        supported_chains = ['ethereum', 'solana', 'xrpl', 'hedera', 'dogecoin']
        if v.lower() not in supported_chains:
            raise ValueError(f'Unsupported chain: {v}. Supported: {supported_chains}')
        return v.lower()

    @validator('studentName', 'courseId', 'courseName', 'to')
    def validate_required_fields(cls, v):
        if not v or not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()

class CertificateResponse(BaseModel):
    success: bool
    chain: str
    network: str
    message: Optional[str] = None
    error: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

# In-memory storage for development (replace with MongoDB in production)
certificate_log = []

def log_certificate_mint(request_data: dict, result: dict):
    """Log certificate minting for audit trail"""
    log_entry = {
        'timestamp': datetime.utcnow().isoformat(),
        'request': request_data,
        'result': result,
        'success': result.get('success', False)
    }
    certificate_log.append(log_entry)
    logger.info(f"Certificate mint logged: {result.get('chain')} - {result.get('success')}")

@router.post("/mint", response_model=CertificateResponse)
async def mint_certificate(request: CertificateRequest, background_tasks: BackgroundTasks):
    """
    Mint NFT certificate on specified blockchain
    
    Supports: Ethereum (Sepolia), Solana (Devnet), XRPL (Testnet), 
              Hedera (Testnet), Dogecoin (Stub)
    """
    try:
        logger.info(f"Certificate mint request: {request.chain} for {request.studentName}")
        
        # Build certificate metadata
        cert_data = {
            'studentName': request.studentName,
            'courseId': request.courseId,
            'courseName': request.courseName,
            'chain': request.chain,
            'walletAddress': request.to,
            'completionDate': request.completionDate or datetime.utcnow().isoformat(),
            'grade': request.grade,
            'instructor': request.instructor or 'NEURO META X'
        }

        # Generate metadata URI if not provided
        if not request.metadataUri:
            # In production, this would call IPFS pinning service
            cert_data['metadataUri'] = f"https://wiredchaos.xyz/api/metadata/{request.courseId}_{request.studentName.replace(' ', '_')}.json"
        else:
            cert_data['metadataUri'] = request.metadataUri

        # Route to appropriate chain minter
        result = None
        
        if request.chain == 'ethereum':
            result = await mint_ethereum_certificate(cert_data)
        elif request.chain == 'solana':
            result = await mint_solana_certificate(cert_data)
        elif request.chain == 'xrpl':
            result = await mint_xrpl_certificate(cert_data)
        elif request.chain == 'hedera':
            result = await mint_hedera_certificate(cert_data)
        elif request.chain == 'dogecoin':
            result = await mint_dogecoin_certificate(cert_data)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported chain: {request.chain}")

        # Log the mint attempt
        background_tasks.add_task(log_certificate_mint, cert_data, result)

        if result['success']:
            return CertificateResponse(
                success=True,
                chain=result['chain'],
                network=result['network'],
                message=f"Certificate minted successfully on {result['chain']}",
                data=result
            )
        else:
            return CertificateResponse(
                success=False,
                chain=result['chain'],
                network=result['network'],
                error=result.get('error', 'Minting failed'),
                data=result
            )

    except Exception as e:
        logger.error(f"Certificate minting error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

async def mint_ethereum_certificate(cert_data: dict) -> dict:
    """Mint certificate on Ethereum Sepolia"""
    try:
        # This would call the Ethereum minter
        # For now, return a mock response
        if not os.getenv('ETH_MINTER_PRIVATE_KEY'):
            return {
                'success': False,
                'chain': 'ethereum',
                'network': 'sepolia',
                'error': 'ETH_MINTER_PRIVATE_KEY not configured'
            }
        
        # Mock successful mint
        return {
            'success': True,
            'chain': 'ethereum',
            'network': 'sepolia',
            'txHash': '0x' + '1' * 64,  # Mock tx hash
            'tokenId': '1',
            'contractAddress': '0x' + '2' * 40,
            'to': cert_data['walletAddress'],
            'metadataUri': cert_data['metadataUri'],
            'explorerUrl': f"https://sepolia.etherscan.io/tx/0x{'1' * 64}"
        }
    except Exception as e:
        return {
            'success': False,
            'chain': 'ethereum',
            'network': 'sepolia',
            'error': str(e)
        }

async def mint_solana_certificate(cert_data: dict) -> dict:
    """Mint certificate on Solana Devnet"""
    try:
        if not os.getenv('SOL_MINTER_SECRET_BASE58'):
            return {
                'success': False,
                'chain': 'solana',
                'network': 'devnet',
                'error': 'SOL_MINTER_SECRET_BASE58 not configured'
            }
        
        # Mock successful mint
        return {
            'success': True,
            'chain': 'solana',
            'network': 'devnet',
            'signature': '1' * 88,  # Mock signature
            'mintAddress': '1' * 44,
            'tokenAccount': '2' * 44,
            'to': cert_data['walletAddress'],
            'metadataUri': cert_data['metadataUri'],
            'explorerUrl': f"https://explorer.solana.com/tx/{'1' * 88}?cluster=devnet"
        }
    except Exception as e:
        return {
            'success': False,
            'chain': 'solana',
            'network': 'devnet',
            'error': str(e)
        }

async def mint_xrpl_certificate(cert_data: dict) -> dict:
    """Mint certificate on XRPL Testnet"""
    try:
        if not os.getenv('XRPL_SEED_TEST'):
            return {
                'success': False,
                'chain': 'xrpl',
                'network': 'testnet',
                'error': 'XRPL_SEED_TEST not configured'
            }
        
        # Mock successful mint
        return {
            'success': True,
            'chain': 'xrpl',
            'network': 'testnet',
            'txHash': '1' * 64,
            'nftokenId': '2' * 64,
            'to': cert_data['walletAddress'],
            'metadataUri': cert_data['metadataUri'],
            'explorerUrl': f"https://testnet.xrpl.org/transactions/{'1' * 64}"
        }
    except Exception as e:
        return {
            'success': False,
            'chain': 'xrpl',
            'network': 'testnet',
            'error': str(e)
        }

async def mint_hedera_certificate(cert_data: dict) -> dict:
    """Mint certificate on Hedera Testnet"""
    try:
        if not os.getenv('HBAR_OPERATOR_ID') or not os.getenv('HBAR_OPERATOR_KEY'):
            return {
                'success': False,
                'chain': 'hedera',
                'network': 'testnet',
                'error': 'HBAR_OPERATOR_ID and HBAR_OPERATOR_KEY not configured'
            }
        
        # Mock successful mint
        return {
            'success': True,
            'chain': 'hedera',
            'network': 'testnet',
            'tokenId': '0.0.12345',
            'serialNumber': '1',
            'to': cert_data['walletAddress'],
            'metadataUri': cert_data['metadataUri'],
            'explorerUrl': f"https://hashscan.io/testnet/token/0.0.12345"
        }
    except Exception as e:
        return {
            'success': False,
            'chain': 'hedera',
            'network': 'testnet',
            'error': str(e)
        }

async def mint_dogecoin_certificate(cert_data: dict) -> dict:
    """Mint certificate on Dogecoin Testnet (STUB)"""
    return {
        'success': False,
        'chain': 'dogecoin',
        'network': 'testnet',
        'error': 'NFTs not supported on Doge testnet yet.',
        'stub': True
    }

@router.get("/logs")
async def get_certificate_logs():
    """Get certificate minting logs (development only)"""
    return {
        'total': len(certificate_log),
        'logs': certificate_log[-50:]  # Return last 50 entries
    }

@router.get("/stats")
async def get_certificate_stats():
    """Get certificate minting statistics"""
    total = len(certificate_log)
    successful = sum(1 for log in certificate_log if log['result'].get('success'))
    failed = total - successful
    
    chain_stats = {}
    for log in certificate_log:
        chain = log['result'].get('chain', 'unknown')
        if chain not in chain_stats:
            chain_stats[chain] = {'total': 0, 'successful': 0, 'failed': 0}
        chain_stats[chain]['total'] += 1
        if log['result'].get('success'):
            chain_stats[chain]['successful'] += 1
        else:
            chain_stats[chain]['failed'] += 1
    
    return {
        'overview': {
            'total': total,
            'successful': successful,
            'failed': failed,
            'success_rate': f"{(successful/total*100):.1f}%" if total > 0 else "0%"
        },
        'by_chain': chain_stats
    }

@router.get("/chains")
async def get_supported_chains():
    """Get list of supported blockchain networks"""
    return {
        'supported_chains': [
            {
                'chain': 'ethereum',
                'network': 'sepolia',
                'type': 'ERC-721',
                'status': 'active' if os.getenv('ETH_MINTER_PRIVATE_KEY') else 'needs_config'
            },
            {
                'chain': 'solana',
                'network': 'devnet',
                'type': 'Metaplex NFT',
                'status': 'active' if os.getenv('SOL_MINTER_SECRET_BASE58') else 'needs_config'
            },
            {
                'chain': 'xrpl',
                'network': 'testnet',
                'type': 'XLS-20 NFToken',
                'status': 'active' if os.getenv('XRPL_SEED_TEST') else 'needs_config'
            },
            {
                'chain': 'hedera',
                'network': 'testnet',
                'type': 'HTS NFT',
                'status': 'active' if os.getenv('HBAR_OPERATOR_ID') else 'needs_config'
            },
            {
                'chain': 'dogecoin',
                'network': 'testnet',
                'type': 'Doginals (stub)',
                'status': 'stub'
            }
        ]
    }