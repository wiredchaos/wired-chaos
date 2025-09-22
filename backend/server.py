import os, feedparser, datetime
from fastapi import FastAPI
from pydantic import BaseModel
import httpx

PORT = int(os.getenv("PORT", "8080"))
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")
MODEL = os.getenv("MODEL", "gpt-4o-mini")
BRAND_TONE = os.getenv("BRAND_TONE", "Wired Chaos tone")

app = FastAPI(title="WIRED CHAOS Bot Brain")

@app.get("/api")
async def api_health():
    return {"status": "WIRED CHAOS Bot Brain API is running", "version": "1.0"}

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)