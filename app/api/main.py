"""FastAPI surface for the Wired Chaos tax engine."""
from __future__ import annotations

import datetime as dt
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.emergent.tax_engine import TaxEngine, load_engine
from app.models.models import ClientProfile

app = FastAPI(title="Wired Chaos Tax Suite", version="1.0.0")
_engine: TaxEngine | None = None


def get_engine() -> TaxEngine:
    global _engine
    if _engine is None:
        _engine = load_engine()
    return _engine


def _jinja_env() -> Environment:
    template_dir = Path(__file__).resolve().parents[1] / "reports" / "templates"
    env = Environment(
        loader=FileSystemLoader(str(template_dir)),
        autoescape=select_autoescape(["html"]),
    )
    env.globals["now"] = dt.datetime.utcnow
    return env


@app.post("/api/tax/analyze")
async def analyze_tax(profile: ClientProfile) -> JSONResponse:
    engine = get_engine()
    baseline = engine.compute_baseline(profile)
    return JSONResponse({"baseline": baseline})


@app.post("/api/tax/optimize")
async def optimize_tax(profile: ClientProfile) -> JSONResponse:
    engine = get_engine()
    result = engine.optimize(profile)
    return JSONResponse(result)


@app.post("/api/tax/report", response_class=HTMLResponse)
async def generate_report(profile: ClientProfile) -> HTMLResponse:
    engine = get_engine()
    context = engine.optimize(profile)
    env = _jinja_env()
    template = env.get_template("report.html")
    html = template.render(**context)
    return HTMLResponse(content=html)


