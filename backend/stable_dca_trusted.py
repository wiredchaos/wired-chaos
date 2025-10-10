from fastapi import FastAPI, HTTPException
from datetime import datetime, timedelta

app = FastAPI()

USER_HISTORY = {}
STABLE_PRICES = { "USDT":1.0, "USDC":1.0, "DAI":1.0, "BUSD":1.0 }

@app.get("/api/stable-dca-trusted")
def stable_dca_trusted(stable: str, amount: float, freq: str, wallet: str):
    if not wallet:
        raise HTTPException(status_code=401, detail="Wallet authentication required")

    history = USER_HISTORY.get(wallet, [])
    if not history:
        date = datetime.now() - timedelta(days=365)
        delta = {"daily":1, "weekly":7, "monthly":30}[freq]
        while date <= datetime.now():
            history.append({"date": date.strftime("%Y-%m-%d"), "value": amount*STABLE_PRICES.get(stable,1)})
            date += timedelta(days=delta)
        USER_HISTORY[wallet] = history

    return {"history": history}
