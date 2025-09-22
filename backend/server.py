import os, feedparser, datetime
from fastapi import FastAPI
from pydantic import BaseModel
import httpx
from starlette.middleware.cors import CORSMiddleware

# Import certificate API and brain assistant API
from cert_api import router as cert_router
from brain_assistant_api import router as brain_router

PORT = int(os.getenv("PORT", "8080"))
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")
MODEL = os.getenv("MODEL", "gpt-4o-mini")
BRAND_TONE = os.getenv("BRAND_TONE", "Wired Chaos tone")

app = FastAPI(title="WIRED CHAOS Bot Brain")

# Include certificate API routes
app.include_router(cert_router)

# Include brain assistant API routes  
app.include_router(brain_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECTIONS = {
    "hub": "Motherboard hub and routing.",
    "csn": "Crypto Spaces Net (separate from 33.3FM).",
    "fm333": "33.3 FM Dogechain radio (Spotify embed).",
    "bwb": "Barbed Wire Broadcast: news/blog feed.",
    "neuro": "NEURO LAB (creator page, portfolio, funnels).",
    "vrg33589": "Lore + vault gamification.",
    "merch": "WIRED CHAOS & BEASTCOAST merch hubs.",
    "vibes": "Evening Vibes → Level Up Lounge."
}

class AskIn(BaseModel):
    message: str
    section: str = "hub"
    user: str | None = None

class AskOut(BaseModel):
    reply: str
    section: str

class RssIn(BaseModel):
    url: str
    max_items: int = 5

class RouteIn(BaseModel):
    text: str

class VaultUserStats(BaseModel):
    total_points: int = 0
    raffle_tickets: int = 0
    fragments_unlocked: list[int] = []
    burn_count: int = 0
    last_activity: str | None = None
    tier: str = "Seeker"

async def llm_complete(prompt: str) -> str:
    # If no LLM key, return stubbed content (so dev isn't blocked).
    if not OPENAI_KEY:
        return f"[DEV STUB]\n{prompt[:320]}"
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_KEY}"},
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system",
                     "content": f"You are WIRED CHAOS. Tone: {BRAND_TONE}. Always keep answers short, neon-cyber, helpful."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.5
            }
        )
    data = r.json()
    return data["choices"][0]["message"]["content"]

@app.get("/api")
async def health_check():
    return {"status": "WIRED CHAOS API Online 🧠", "version": "2.0.0"}

@app.post("/api/ask", response_model=AskOut)
async def ask(inb: AskIn):
    section_desc = SECTIONS.get(inb.section, "hub")
    prompt = f"""
User: {inb.user or "guest"}
Section: {inb.section} — {section_desc}
Goal: Answer helpfully and route if needed. Keep to brand palette (neon cyan #00FFFF, glitch red #FF3131, electric green #39FF14) and avoid white backgrounds.

Q: {inb.message}
"""
    reply = await llm_complete(prompt)
    return AskOut(reply=reply, section=inb.section)

@app.post("/api/rss/summarize")
async def rss_sum(inb: RssIn):
    feed = feedparser.parse(inb.url)
    items = feed.entries[:inb.max_items]
    bullet = []
    for e in items:
        title = getattr(e, "title", "Untitled")
        link = getattr(e, "link", "")
        summ = getattr(e, "summary", "")[:600]
        bullet.append(f"- **{title}** — {link}\n  {summ}")
    prompt = f"Summarize these items into 6 neon bullets with CTAs for Wired Chaos audience:\n\n" + "\n".join(bullet)
    reply = await llm_complete(prompt)
    return {"summary": reply, "count": len(items), "generated_at": datetime.datetime.utcnow().isoformat()+"Z"}

@app.post("/api/route")
async def route(inb: RouteIn):
    # simple keyword-based router; you can expand later
    t = inb.text.lower()
    if any(k in t for k in ["csn","crypto spaces"]): return {"section": "csn"}
    if "33.3" in t or "dogechain" in t: return {"section": "fm333"}
    if any(k in t for k in ["news","blog","broadcast","barbed"]): return {"section": "bwb"}
    if "neuro" in t: return {"section": "neuro"}
    if "vrg" in t or "33589" in t: return {"section": "vrg33589"}
    if "merch" in t or "store" in t: return {"section": "merch"}
    if "vibes" in t or "lounge" in t: return {"section": "vibes"}
    return {"section": "hub"}

# VAULT33 Dashboard API Endpoints
@app.get("/api/vault/user/{user_id}/stats", response_model=VaultUserStats)
async def get_vault_user_stats(user_id: str):
    """Get comprehensive user stats for VAULT33 dashboard"""
    # Mock data for now - integrate with Gatekeeper database later
    mock_stats = VaultUserStats(
        total_points=350,
        raffle_tickets=12,
        fragments_unlocked=[1, 3],
        burn_count=5,
        last_activity=datetime.datetime.utcnow().isoformat(),
        tier="Holder"
    )
    return mock_stats

@app.get("/api/vault/leaderboard")
async def get_vault_leaderboard(limit: int = 10):
    """Get VAULT33 points leaderboard"""
    # Mock leaderboard data
    mock_leaderboard = [
        {"user_id": "user1", "points": 1250, "tier": "Merovingian", "fragments": 5},
        {"user_id": "user2", "points": 890, "tier": "Pathfinder", "fragments": 4},
        {"user_id": "user3", "points": 650, "tier": "Pathfinder", "fragments": 3},
        {"user_id": "user4", "points": 420, "tier": "Holder", "fragments": 2},
        {"user_id": "user5", "points": 180, "tier": "Holder", "fragments": 1},
    ]
    return {"leaderboard": mock_leaderboard[:limit], "total_users": len(mock_leaderboard)}

@app.post("/api/vault/user/{user_id}/burn")
async def register_burn(user_id: str, token_id: str, tx_hash: str = None):
    """Register a burn transaction for user"""
    # Mock response - integrate with Gatekeeper logic later
    return {
        "success": True,
        "user_id": user_id,
        "token_id": token_id,
        "tx_hash": tx_hash,
        "points_awarded": 50,
        "fragment_unlocked": None,
        "message": f"🔥 Burn registered for token {token_id}. +50 WL Points awarded."
    }

@app.get("/api/vault/fragments/{fragment_id}")
async def get_fragment_info(fragment_id: int):
    """Get information about a specific Merovingian fragment"""
    fragments = {
        1: {"name": "Mask of the West", "hint": "mask of the west\nburn token with trait red tie", "recipe": "red_tie"},
        2: {"name": "Ember Sangréal", "hint": "ember sangréal\nburn descendant of 82675", "recipe": "descendant_82675"},
        3: {"name": "Third Column Chalice", "hint": "third column chalice\nseek vault layer 9", "recipe": "layer_9"},
        4: {"name": "Five Burnings Aligned", "hint": "when five burnings align, the key will hum", "recipe": "alignment"},
        5: {"name": "Sangréal Loop 33·3", "hint": "the sangréal loop closes under 33·3", "recipe": "frequency_33_3"}
    }
    
    if fragment_id not in fragments:
        return {"error": "Fragment not found"}
    
    return {
        "fragment_id": fragment_id,
        "fragment_info": fragments[fragment_id],
        "unlocked": True  # Mock - should check user's actual progress
    }

@app.get("/api/blog/proxy")
async def blog_proxy():
    """Proxy blog feed for BWB integration"""
    try:
        # Try to fetch from multiple potential endpoints
        blog_urls = [
            "https://www.wiredchaos.xyz/blog-feed.xml",
            "https://www.wiredchaos.xyz/feed.xml",
            "https://www.wiredchaos.xyz/rss"
        ]
        
        for url in blog_urls:
            try:
                async with httpx.AsyncClient(timeout=10) as client:
                    response = await client.get(url)
                    if response.status_code == 200:
                        # Parse RSS/XML and return structured data
                        feed = feedparser.parse(response.content)
                        posts = []
                        
                        for entry in feed.entries[:8]:  # Limit to 8 posts
                            posts.append({
                                "title": getattr(entry, "title", "Untitled"),
                                "link": getattr(entry, "link", ""),
                                "description": getattr(entry, "summary", "")[:200],
                                "published": getattr(entry, "published", "")
                            })
                        
                        return {"posts": posts, "source": url, "count": len(posts)}
            except:
                continue
        
        # Fallback mock data if all feeds fail
        return {
            "posts": [
                {
                    "title": "🔥 WIRED CHAOS Blog System Online",
                    "link": "https://www.wiredchaos.xyz/blog",
                    "description": "The new blog integration system is live with RSS proxy support and caching.",
                    "published": datetime.datetime.utcnow().isoformat()
                }
            ],
            "source": "fallback",
            "count": 1
        }
    except Exception as e:
        return {"error": "Blog feed temporarily unavailable", "details": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)