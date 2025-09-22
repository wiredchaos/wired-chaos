"""
VAULT33 Gatekeeper - Utility Functions
"""
import hmac
import hashlib
from typing import Dict, Any
from loguru import logger
from .config import Config

def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verify HMAC signature for webhook payload"""
    try:
        expected_signature = hmac.new(
            Config.WEBHOOK_SECRET.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        # Remove 'sha256=' prefix if present
        if signature.startswith('sha256='):
            signature = signature[7:]
        
        return hmac.compare_digest(expected_signature, signature)
    except Exception as e:
        logger.error(f"❌ Webhook signature verification error: {e}")
        return False

def format_points_display(points: int) -> str:
    """Format points for display"""
    if points >= 1000:
        return f"{points:,}"
    return str(points)

def format_user_status_message(status: Dict[str, Any]) -> str:
    """Format user status for Discord/Telegram display"""
    points = status.get("total_points", 0)
    tickets = status.get("raffle_tickets", 0)
    fragments = status.get("fragments_unlocked", [])
    sangreal_unlocked = status.get("sangreal_unlocked", False)
    
    message = f"🔐 **VAULT33 STATUS**\n"
    message += f"💎 WL Points: **{format_points_display(points)}**\n"
    message += f"🎫 Raffle Tickets: **{tickets}**\n"
    message += f"🧩 Fragments: **{len(fragments)}/5**"
    
    if fragments:
        fragment_list = ", ".join([f"#{f}" for f in sorted(fragments)])
        message += f" ({fragment_list})"
    
    message += "\n"
    
    if sangreal_unlocked:
        message += "👑 **SANGRÉAL KEY UNLOCKED!**\n"
    elif len(fragments) >= 3:
        message += "🔥 **Path Seeker** - Close to the Sangréal...\n"
    elif len(fragments) >= 1:
        message += "🕯️ **Fragment Keeper** - The path reveals itself...\n"
    else:
        message += "🔍 **Seeker** - Begin your journey with /burn...\n"
    
    return message

def format_burn_success_message(result: Dict[str, Any]) -> str:
    """Format burn success message"""
    token_id = result.get("token_id", "Unknown")
    points = result.get("points_awarded", 0)
    fragment = result.get("fragment_unlocked")
    
    message = f"🔥 **BURN CONFIRMED**\n"
    message += f"Token: **{token_id}**\n"
    message += f"Points Awarded: **+{points}**\n"
    
    if fragment:
        message += f"\n🧩 **MEROVINGIAN FRAGMENT #{fragment} UNLOCKED!**\n"
        message += "Check your DMs for the fragment clue..."
    
    return message

def is_admin(discord_id: int) -> bool:
    """Check if user is admin"""
    return discord_id in Config.ADMIN_DISCORD_IDS

class EmbedColors:
    """Discord embed colors"""
    SUCCESS = 0x00ff88
    ERROR = 0xff3131
    WARNING = 0xffaa00
    INFO = 0x00e5ff
    FRAGMENT = 0x8000ff