#!/usr/bin/env python3
"""
VAULT33 Gatekeeper - Main Entry Point
Runs Discord bot, Telegram bot, and FastAPI server concurrently
"""
import asyncio
import os
import multiprocessing as mp
from dotenv import load_dotenv
from loguru import logger

load_dotenv()

def run_discord_bot():
    """Run Discord bot in separate process"""
    from bots.discord_bot import run_bot
    run_bot()

def run_telegram_bot():
    """Run Telegram bot in separate process"""
    from bots.telegram_bot import run_bot
    run_bot()

def run_api_server():
    """Run FastAPI server in separate process"""
    import uvicorn
    from api.server import app
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8080))
    
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    logger.info("🔐 Starting VAULT33 Gatekeeper System...")
    
    processes = []
    
    # Start Discord bot
    if os.getenv("DISCORD_BOT_TOKEN"):
        discord_process = mp.Process(target=run_discord_bot, daemon=True)
        discord_process.start()
        processes.append(discord_process)
        logger.info("🤖 Discord bot process started")
    
    # Start Telegram bot
    if os.getenv("TELEGRAM_BOT_TOKEN"):
        telegram_process = mp.Process(target=run_telegram_bot, daemon=True)
        telegram_process.start()
        processes.append(telegram_process)
        logger.info("📱 Telegram bot process started")
    
    # Start API server
    api_process = mp.Process(target=run_api_server, daemon=True)
    api_process.start()
    processes.append(api_process)
    logger.info("🌐 FastAPI server process started")
    
    try:
        # Keep main process alive
        for process in processes:
            process.join()
    except KeyboardInterrupt:
        logger.info("🛑 Shutdown signal received...")
        for process in processes:
            process.terminate()
            process.join()
        logger.info("✅ All processes terminated")