"""
VAULT33 Gatekeeper - Telegram Bot
Mirrors Discord commands for Telegram users
"""
import asyncio
from typing import Optional
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, CommandHandler, MessageHandler, 
    filters, ContextTypes, CallbackQueryHandler
)
from loguru import logger

from ..shared.config import Config
from ..shared.database import db_manager
from ..shared.gamification import gamification
from ..shared.xrpl_validator import xrpl_validator
from ..shared.utils import format_user_status_message, format_burn_success_message, is_admin

class TelegramGatekeeper:
    def __init__(self):
        self.app = None
    
    async def initialize(self):
        """Initialize database connection"""
        await db_manager.connect()
        logger.info("🔐 VAULT33 Telegram Bot initialized")
    
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Start command handler"""
        user_id = update.effective_user.id
        username = update.effective_user.username or "Unknown"
        
        welcome_text = (
            "🔐 **VAULT33 GATEKEEPER**\n\n"
            "Welcome to the VAULT33 Telegram portal.\n\n"
            "**Available Commands:**\n"
            "/claimwl <tier> - Claim whitelist\n"
            "/status - Check your VAULT33 status\n"
            "/mint <tier> <token_id> <tx_hash> - Register mint\n"
            "/burn <token_id> <tx_hash> - Register burn\n"
            "/hint - Get next Merovingian clue\n"
            "/track <token_id> - Track token status\n\n"
            "The Vault watches... 🕯️"
        )
        
        keyboard = [
            [InlineKeyboardButton("📊 Check Status", callback_data="status")],
            [InlineKeyboardButton("🧩 Get Hint", callback_data="hint")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            welcome_text, 
            parse_mode='Markdown',
            reply_markup=reply_markup
        )
        
        logger.info(f"📱 Telegram user {username} ({user_id}) started bot")
    
    async def claimwl_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Claim whitelist command"""
        try:
            if not context.args or len(context.args) != 1:
                await update.message.reply_text(
                    "❌ Usage: /claimwl <tier>\nExample: /claimwl tier1"
                )
                return
            
            tier = context.args[0].lower()
            if tier not in ["tier1", "tier2"]:
                await update.message.reply_text("❌ Invalid tier. Use 'tier1' or 'tier2'")
                return
            
            telegram_id = update.effective_user.id
            # For Telegram, we'll use telegram_id but may need to link to Discord later
            # For now, treating telegram_id as discord_id for consistency
            result = await gamification.process_wl_claim(telegram_id, tier)
            
            if result["success"]:
                response = f"✅ **Whitelist {tier.upper()} claimed**\n\n{result['message']}\n\n🕯️ Keep your secret seed safe — fragments come later"
            else:
                response = f"❌ **Claim Failed**\n{result.get('error', 'Unknown error')}"
            
            await update.message.reply_text(response, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"❌ Telegram WL claim error: {e}")
            await update.message.reply_text("❌ An error occurred processing your claim.")
    
    async def status_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Status command handler"""
        try:
            telegram_id = update.effective_user.id
            status = await gamification.get_user_status(telegram_id)
            
            if "error" in status:
                response = f"❌ **Status Error**\n{status['error']}"
            else:
                response = format_user_status_message(status)
                
                # Add fragment progress
                fragments = status.get("fragments_unlocked", [])
                progress = "🧩" * len(fragments) + "⬜" * (5 - len(fragments))
                response += f"\n**Fragment Progress:** {progress}"
            
            await update.message.reply_text(response, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"❌ Telegram status error: {e}")
            await update.message.reply_text("❌ An error occurred retrieving your status.")
    
    async def mint_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Mint command handler"""
        try:
            if not context.args or len(context.args) != 3:
                await update.message.reply_text(
                    "❌ Usage: /mint <tier> <token_id> <tx_hash>\n"
                    "Example: /mint tier1 12345 ABC123..."
                )
                return
            
            tier, token_id, tx_hash = context.args
            tier = tier.lower()
            
            if tier not in ["tier1", "tier2"]:
                await update.message.reply_text("❌ Invalid tier. Use 'tier1' or 'tier2'")
                return
            
            telegram_id = update.effective_user.id
            
            # Validate XRPL transaction
            validation = await xrpl_validator.validate_mint_transaction(tx_hash)
            
            if not validation["valid"]:
                await update.message.reply_text(
                    f"❌ **Invalid Transaction**\n{validation.get('error', 'Transaction validation failed')}"
                )
                return
            
            # Process mint
            result = await gamification.process_mint(telegram_id, tier, token_id, tx_hash)
            
            if result["success"]:
                response = f"🚨 **MINT CONFIRMED** 🚨\n\n{result['message']}\n\n✅ **Burnable for Path Clues**"
            else:
                response = f"❌ **Mint Registration Failed**\n{result.get('error', 'Unknown error')}"
            
            await update.message.reply_text(response, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"❌ Telegram mint error: {e}")
            await update.message.reply_text("❌ An error occurred processing your mint.")
    
    async def burn_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Burn command handler"""
        try:
            if not context.args or len(context.args) != 2:
                await update.message.reply_text(
                    "❌ Usage: /burn <token_id> <tx_hash>\n"
                    "Example: /burn 12345 ABC123..."
                )
                return
            
            token_id, tx_hash = context.args
            telegram_id = update.effective_user.id
            
            # Validate XRPL burn transaction
            validation = await xrpl_validator.validate_burn_transaction(tx_hash, token_id)
            
            if not validation["valid"]:
                await update.message.reply_text(
                    f"❌ **Invalid Burn Transaction**\n{validation.get('error', 'Transaction validation failed')}"
                )
                return
            
            # Process burn
            result = await gamification.process_burn(telegram_id, token_id, tx_hash)
            
            if result["success"]:
                response = format_burn_success_message(result)
                
                # If fragment unlocked, send hint via DM
                if result.get("fragment_unlocked"):
                    fragment_index = result["fragment_unlocked"]
                    hint = gamification.get_fragment_hint(fragment_index)
                    
                    if hint:
                        fragment_message = (
                            f"🧩 **Fragment #{fragment_index} Unlocked**\n\n"
                            f"**The sigil answered**\n\n"
                            f"*{hint}*\n\n"
                            f"The Vault watches 🕯️"
                        )
                        
                        # Send fragment hint as separate message
                        await update.message.reply_text(fragment_message, parse_mode='Markdown')
            else:
                response = f"❌ **Burn Registration Failed**\n{result.get('error', 'Unknown error')}"
            
            await update.message.reply_text(response, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"❌ Telegram burn error: {e}")
            await update.message.reply_text("❌ An error occurred processing your burn.")
    
    async def hint_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Hint command handler"""
        try:
            telegram_id = update.effective_user.id
            hint_data = await gamification.get_next_fragment_hint(telegram_id)
            
            if hint_data:
                fragment_index, hint_text = hint_data
                response = (
                    f"🕯️ **Fragment #{fragment_index} Hint**\n\n"
                    f"*{hint_text}*\n\n"
                    f"🔥 Burn the correct token to unlock this fragment"
                )
            else:
                response = "🔐 **Path Complete**\nAll fragments unlocked or none available"
            
            await update.message.reply_text(response, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"❌ Telegram hint error: {e}")
            await update.message.reply_text("❌ An error occurred retrieving your hint.")
    
    async def track_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Track token command"""
        try:
            if not context.args or len(context.args) != 1:
                await update.message.reply_text(
                    "❌ Usage: /track <token_id>\nExample: /track 12345"
                )
                return
            
            token_id = context.args[0]
            token = await db_manager.get_token(token_id)
            
            if not token:
                response = f"❌ **Token Not Found**\nToken {token_id} not registered in VAULT33"
            else:
                status = "🔥 BURNED" if token["burn_status"] == "burned" else "✅ ACTIVE"
                response = (
                    f"🏷️ **Token {token_id}**\n\n"
                    f"**Status:** {status}\n"
                    f"**Owner:** {token['owner_discord_id']}"
                )
                
                if token["burn_status"] == "burned":
                    response += f"\n**Burned At:** {token.get('burned_at', 'Unknown')}"
            
            await update.message.reply_text(response, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"❌ Telegram track error: {e}")
            await update.message.reply_text("❌ An error occurred tracking the token.")
    
    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle inline keyboard callbacks"""
        query = update.callback_query
        await query.answer()
        
        if query.data == "status":
            await self.status_command(update, context)
        elif query.data == "hint":
            await self.hint_command(update, context)
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Help command"""
        help_text = (
            "🔐 **VAULT33 GATEKEEPER COMMANDS**\n\n"
            "**Whitelist & Status:**\n"
            "/claimwl <tier> - Claim whitelist (tier1/tier2)\n"
            "/status - Check your VAULT33 status\n\n"
            "**Mint & Burn:**\n"
            "/mint <tier> <token_id> <tx_hash> - Register mint\n"
            "/burn <token_id> <tx_hash> - Register burn\n\n"
            "**Merovingian Path:**\n"
            "/hint - Get next fragment clue\n"
            "/track <token_id> - Track token status\n\n"
            "**Example:**\n"
            "/claimwl tier1\n"
            "/mint tier1 12345 ABC123...\n"
            "/burn 12345 DEF456...\n\n"
            "The Vault watches... 🕯️"
        )
        
        await update.message.reply_text(help_text, parse_mode='Markdown')

def run_bot():
    """Run the Telegram bot"""
    try:
        gatekeeper = TelegramGatekeeper()
        
        # Create application
        app = Application.builder().token(Config.TELEGRAM_BOT_TOKEN).build()
        
        # Initialize database connection
        app.job_queue.run_once(lambda context: asyncio.create_task(gatekeeper.initialize()), 0)
        
        # Command handlers
        app.add_handler(CommandHandler("start", gatekeeper.start_command))
        app.add_handler(CommandHandler("help", gatekeeper.help_command))
        app.add_handler(CommandHandler("claimwl", gatekeeper.claimwl_command))
        app.add_handler(CommandHandler("status", gatekeeper.status_command))
        app.add_handler(CommandHandler("mint", gatekeeper.mint_command))
        app.add_handler(CommandHandler("burn", gatekeeper.burn_command))
        app.add_handler(CommandHandler("hint", gatekeeper.hint_command))
        app.add_handler(CommandHandler("track", gatekeeper.track_command))
        
        # Callback handler for inline keyboards
        app.add_handler(CallbackQueryHandler(gatekeeper.button_callback))
        
        logger.info("📱 Starting Telegram bot...")
        app.run_polling(allowed_updates=Update.ALL_TYPES)
        
    except Exception as e:
        logger.error(f"❌ Telegram bot startup error: {e}")
        raise