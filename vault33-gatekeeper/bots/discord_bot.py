"""
VAULT33 Gatekeeper - Discord Bot
Handles slash commands for WL gamification and Merovingian path tracking
"""
import asyncio
from typing import Optional
import discord
from discord.ext import commands
from discord import app_commands
from loguru import logger

from ..shared.config import Config
from ..shared.database import db_manager
from ..shared.gamification import gamification
from ..shared.xrpl_validator import xrpl_validator
from ..shared.utils import (
    format_user_status_message, format_burn_success_message, 
    is_admin, EmbedColors
)

class VaultBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        intents.guilds = True
        intents.members = True
        
        super().__init__(
            command_prefix='!vault',
            intents=intents,
            description="VAULT33 Gatekeeper - WL Gamification & Merovingian Path Tracking"
        )
    
    async def setup_hook(self):
        """Initialize bot components"""
        await db_manager.connect()
        logger.info("🔐 VAULT33 Discord Bot initialized")
    
    async def on_ready(self):
        """Bot ready event"""
        logger.info(f"🤖 Discord bot logged in as {self.user}")
        
        # Sync commands to guild
        if Config.DISCORD_GUILD_ID:
            guild = discord.Object(id=Config.DISCORD_GUILD_ID)
            self.tree.copy_global_to(guild=guild)
            await self.tree.sync(guild=guild)
            logger.info(f"📋 Commands synced to guild {Config.DISCORD_GUILD_ID}")
        else:
            await self.tree.sync()
            logger.info("📋 Commands synced globally")

# Create bot instance
bot = VaultBot()

@bot.tree.command(name="wl-claim", description="Claim your whitelist spot")
@app_commands.describe(tier="Whitelist tier (tier1, tier2)")
@app_commands.choices(tier=[
    app_commands.Choice(name="Tier 1", value="tier1"),
    app_commands.Choice(name="Tier 2", value="tier2")
])
async def wl_claim(interaction: discord.Interaction, tier: app_commands.Choice[str]):
    """Claim whitelist spot"""
    await interaction.response.defer()
    
    try:
        discord_id = interaction.user.id
        result = await gamification.process_wl_claim(discord_id, tier.value)
        
        if result["success"]:
            embed = discord.Embed(
                title="✅ Whitelist Claimed",
                description=result["message"],
                color=EmbedColors.SUCCESS
            )
            embed.add_field(name="Tier", value=tier.name, inline=True)
            embed.add_field(name="Next Step", value="Mint to activate Access Pass", inline=True)
            embed.set_footer(text="Keep your secret seed safe — fragments come later 🕯️")
        else:
            embed = discord.Embed(
                title="❌ Claim Failed",
                description=result.get("error", "Unknown error"),
                color=EmbedColors.ERROR
            )
        
        await interaction.followup.send(embed=embed)
        
    except Exception as e:
        logger.error(f"❌ WL claim command error: {e}")
        await interaction.followup.send("❌ An error occurred processing your claim.")

@bot.tree.command(name="wl-status", description="Check your VAULT33 status")
async def wl_status(interaction: discord.Interaction):
    """Show user's WL status"""
    await interaction.response.defer()
    
    try:
        discord_id = interaction.user.id
        status = await gamification.get_user_status(discord_id)
        
        if "error" in status:
            embed = discord.Embed(
                title="❌ Status Error",
                description=status["error"],
                color=EmbedColors.ERROR
            )
        else:
            message = format_user_status_message(status)
            embed = discord.Embed(
                title="🔐 VAULT33 STATUS",
                description=message,
                color=EmbedColors.INFO
            )
            
            # Add progress bar for fragments
            fragments = status.get("fragments_unlocked", [])
            progress = "🧩" * len(fragments) + "⬜" * (5 - len(fragments))
            embed.add_field(name="Fragment Progress", value=progress, inline=False)
        
        await interaction.followup.send(embed=embed)
        
    except Exception as e:
        logger.error(f"❌ Status command error: {e}")
        await interaction.followup.send("❌ An error occurred retrieving your status.")

@bot.tree.command(name="mint", description="Register a mint transaction")
@app_commands.describe(
    tier="Mint tier",
    token_id="Token ID from mint",
    tx_hash="XRPL transaction hash"
)
@app_commands.choices(tier=[
    app_commands.Choice(name="Tier 1", value="tier1"),
    app_commands.Choice(name="Tier 2", value="tier2")
])
async def mint_command(interaction: discord.Interaction, tier: app_commands.Choice[str], 
                      token_id: str, tx_hash: str):
    """Register mint transaction"""
    await interaction.response.defer()
    
    try:
        discord_id = interaction.user.id
        
        # Validate XRPL transaction
        validation = await xrpl_validator.validate_mint_transaction(tx_hash)
        
        if not validation["valid"]:
            embed = discord.Embed(
                title="❌ Invalid Transaction",
                description=validation.get("error", "Transaction validation failed"),
                color=EmbedColors.ERROR
            )
            await interaction.followup.send(embed=embed)
            return
        
        # Process mint
        result = await gamification.process_mint(discord_id, tier.value, token_id, tx_hash)
        
        if result["success"]:
            embed = discord.Embed(
                title="🚨 MINT CONFIRMED 🚨",
                description=result["message"],
                color=EmbedColors.SUCCESS
            )
            embed.add_field(name="Transaction", value=f"[View TX]({tx_hash})", inline=True)
            embed.add_field(name="Burnable", value="YES - for Path Clues", inline=True)
        else:
            embed = discord.Embed(
                title="❌ Mint Registration Failed",
                description=result.get("error", "Unknown error"),
                color=EmbedColors.ERROR
            )
        
        await interaction.followup.send(embed=embed)
        
    except Exception as e:
        logger.error(f"❌ Mint command error: {e}")
        await interaction.followup.send("❌ An error occurred processing your mint.")

@bot.tree.command(name="burn", description="Register a burn transaction")
@app_commands.describe(
    token_id="Token ID to burn",
    tx_hash="XRPL burn transaction hash"
)
async def burn_command(interaction: discord.Interaction, token_id: str, tx_hash: str):
    """Register burn transaction"""
    await interaction.response.defer()
    
    try:
        discord_id = interaction.user.id
        
        # Validate XRPL burn transaction
        validation = await xrpl_validator.validate_burn_transaction(tx_hash, token_id)
        
        if not validation["valid"]:
            embed = discord.Embed(
                title="❌ Invalid Burn Transaction",
                description=validation.get("error", "Transaction validation failed"),
                color=EmbedColors.ERROR
            )
            await interaction.followup.send(embed=embed)
            return
        
        # Process burn
        result = await gamification.process_burn(discord_id, token_id, tx_hash)
        
        if result["success"]:
            message = format_burn_success_message(result)
            embed = discord.Embed(
                title="🔥 BURN CONFIRMED",
                description=message,
                color=EmbedColors.SUCCESS if not result.get("fragment_unlocked") else EmbedColors.FRAGMENT
            )
            
            # If fragment unlocked, send DM with clue
            if result.get("fragment_unlocked"):
                fragment_index = result["fragment_unlocked"]
                hint = gamification.get_fragment_hint(fragment_index)
                
                if hint:
                    try:
                        dm_embed = discord.Embed(
                            title=f"🧩 Fragment #{fragment_index} Unlocked",
                            description=f"**The sigil answered**\n\n*{hint}*\n\nThe Vault watches 🕯️",
                            color=EmbedColors.FRAGMENT
                        )
                        await interaction.user.send(embed=dm_embed)
                        embed.add_field(name="Fragment Clue", value="Sent to your DMs", inline=False)
                    except discord.Forbidden:
                        embed.add_field(name="Fragment Clue", value="Enable DMs to receive clues", inline=False)
        else:
            embed = discord.Embed(
                title="❌ Burn Registration Failed",
                description=result.get("error", "Unknown error"),
                color=EmbedColors.ERROR
            )
        
        await interaction.followup.send(embed=embed)
        
    except Exception as e:
        logger.error(f"❌ Burn command error: {e}")
        await interaction.followup.send("❌ An error occurred processing your burn.")

@bot.tree.command(name="path-hint", description="Get your next Merovingian path hint")
async def path_hint(interaction: discord.Interaction):
    """Get next fragment hint"""
    await interaction.response.defer(ephemeral=True)
    
    try:
        discord_id = interaction.user.id
        hint_data = await gamification.get_next_fragment_hint(discord_id)
        
        if hint_data:
            fragment_index, hint_text = hint_data
            embed = discord.Embed(
                title=f"🕯️ Fragment #{fragment_index} Hint",
                description=f"*{hint_text}*",
                color=EmbedColors.FRAGMENT
            )
            embed.set_footer(text="Burn the correct token to unlock this fragment")
        else:
            embed = discord.Embed(
                title="🔐 Path Complete",
                description="All fragments unlocked or none available",
                color=EmbedColors.INFO
            )
        
        await interaction.followup.send(embed=embed)
        
    except Exception as e:
        logger.error(f"❌ Path hint command error: {e}")
        await interaction.followup.send("❌ An error occurred retrieving your hint.")

@bot.tree.command(name="track", description="Track token burn status")
@app_commands.describe(token_id="Token ID to check")
async def track_token(interaction: discord.Interaction, token_id: str):
    """Track token status"""
    await interaction.response.defer()
    
    try:
        token = await db_manager.get_token(token_id)
        
        if not token:
            embed = discord.Embed(
                title="❌ Token Not Found",
                description=f"Token {token_id} not registered in VAULT33",
                color=EmbedColors.ERROR
            )
        else:
            status = "🔥 BURNED" if token["burn_status"] == "burned" else "✅ ACTIVE"
            embed = discord.Embed(
                title=f"🏷️ Token {token_id}",
                color=EmbedColors.SUCCESS if token["burn_status"] == "active" else EmbedColors.WARNING
            )
            embed.add_field(name="Status", value=status, inline=True)
            embed.add_field(name="Owner", value=f"<@{token['owner_discord_id']}>", inline=True)
            
            if token["burn_status"] == "burned":
                embed.add_field(name="Burned At", value=token.get("burned_at", "Unknown"), inline=False)
        
        await interaction.followup.send(embed=embed)
        
    except Exception as e:
        logger.error(f"❌ Track command error: {e}")
        await interaction.followup.send("❌ An error occurred tracking the token.")

@bot.tree.command(name="admin-grant-points", description="[ADMIN] Grant points to user")
@app_commands.describe(
    user="User to grant points to",
    amount="Amount of points to grant",
    reason="Reason for granting points"
)
async def admin_grant_points(interaction: discord.Interaction, user: discord.Member, 
                           amount: int, reason: str = "Admin grant"):
    """Admin command to grant points"""
    await interaction.response.defer()
    
    try:
        if not is_admin(interaction.user.id):
            embed = discord.Embed(
                title="❌ Access Denied",
                description="This command requires admin privileges",
                color=EmbedColors.ERROR
            )
            await interaction.followup.send(embed=embed, ephemeral=True)
            return
        
        await db_manager.add_points(user.id, amount, reason)
        
        embed = discord.Embed(
            title="✅ Points Granted",
            description=f"Granted {amount} points to {user.mention}\nReason: {reason}",
            color=EmbedColors.SUCCESS
        )
        
        await interaction.followup.send(embed=embed)
        
    except Exception as e:
        logger.error(f"❌ Admin grant points error: {e}")
        await interaction.followup.send("❌ An error occurred granting points.")

def run_bot():
    """Run the Discord bot"""
    try:
        bot.run(Config.DISCORD_BOT_TOKEN)
    except Exception as e:
        logger.error(f"❌ Discord bot startup error: {e}")
        raise