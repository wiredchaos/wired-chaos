"""
VAULT33 Gatekeeper - Configuration Management
"""
import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Bot Tokens
    DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
    TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
    
    # Discord Config
    DISCORD_GUILD_ID = int(os.getenv("DISCORD_GUILD_ID", 0))
    DISCORD_LOG_CHANNEL_ID = int(os.getenv("DISCORD_LOG_CHANNEL_ID", 0))
    DISCORD_ACCESS_ROLE_ID = int(os.getenv("DISCORD_ACCESS_ROLE_ID", 0))
    DISCORD_PATH_SEEKER_ROLE_ID = int(os.getenv("DISCORD_PATH_SEEKER_ROLE_ID", 0))
    
    # MongoDB
    MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "vault33_gatekeeper")
    
    # API Config
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", 8080))
    WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "change_this_secret")
    
    # XRPL Config
    XRPL_RPC_URL = os.getenv("XRPL_RPC_URL", "https://s1.ripple.com:51234")
    XRPL_NETWORK = os.getenv("XRPL_NETWORK", "mainnet")
    
    # Gamification Points
    WL_CLAIM_POINTS = int(os.getenv("WL_CLAIM_POINTS", 10))
    MINT_TIER1_POINTS = int(os.getenv("MINT_TIER1_POINTS", 20))
    MINT_TIER2_POINTS = int(os.getenv("MINT_TIER2_POINTS", 40))
    BURN_BASE_POINTS = int(os.getenv("BURN_BASE_POINTS", 50))
    BURN_MEROVINGIAN_POINTS = int(os.getenv("BURN_MEROVINGIAN_POINTS", 250))
    REFERRAL_POINTS = int(os.getenv("REFERRAL_POINTS", 15))
    
    # Admin Config
    ADMIN_DISCORD_IDS: List[int] = [
        int(id_str) for id_str in os.getenv("ADMIN_DISCORD_IDS", "").split(",") 
        if id_str.strip().isdigit()
    ]
    
    # Merovingian Fragments (base64 encoded for obfuscation)
    FRAGMENTS = {
        1: "TWFzayBmb3VuZCDigJQgd2hpc3BlciBlbWJlciBhdCBzZWNvbmQgZGF3bg==",  # Mask found — whisper ember at second dawn
        2: "Q2hhbGljZSBoaWRlcyBiZW5lYXRoIHRoZSB0aGlyZCBjb2x1bW4=",  # Chalice hides beneath the third column
        3: "U3BlYWsgJ2VtYmVyLXNhbmdyw6lhbC04MjY3NScgd2hlcmUgd2FsbHMgbGlzdGVu",  # Speak 'ember-sangréal-82675' where walls listen
        4: "V2hlbiBmaXZlIGJ1cm5pbmdzIGFsaWduLCB0aGUga2V5IHdpbGwgaHVt",  # When five burnings align, the key will hum
        5: "VGhlIFNhbmdyw6lhbCBsb29wIGNsb3NlcyB1bmRlciAzMyXCtzM="  # The Sangréal loop closes under 33·3
    }
    
    # Burn Recipes for Merovingian Fragments
    BURN_RECIPES = {
        "MEROV_1": {"trait": "red_tie", "fragment": 1},
        "MEROV_2": {"descendant": "82675", "fragment": 2},
        "MEROV_3": {"layer": "9", "fragment": 3},
        "MEROV_4": {"alignment": "five_burns", "fragment": 4},
        "MEROV_5": {"frequency": "33.3", "fragment": 5}
    }