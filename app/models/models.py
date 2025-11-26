"""Pydantic domain models for the Wired Chaos tax suite."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, validator


class Entity(BaseModel):
    type: str = Field(..., description="Entity type (S_Corp, Partnership, etc.)")
    name: str
    ownership_pct: float = Field(..., ge=0, le=100)
    k1_box1: Optional[float] = None
    reasonable_comp: Optional[float] = None
    qbi_qualified: bool = False


class AssetLot(BaseModel):
    acq_date: str
    shares: float = Field(..., ge=0)
    cost_basis: float
    proceeds: Optional[float] = 0.0


class DigitalAsset(BaseModel):
    asset: str
    activity: List[str]
    type: Optional[str] = None
    wallet: Optional[str] = None
    cost_basis: Optional[float] = None
    proceeds: Optional[float] = None
    income_usd: Optional[float] = None
    lots: List[AssetLot] = Field(default_factory=list)

    @property
    def realized_gain(self) -> float:
        if self.proceeds is None or self.cost_basis is None:
            return 0.0
        return self.proceeds - self.cost_basis


class ClientProfile(BaseModel):
    tax_year: int
    filing_status: str
    state: str
    entities: List[Entity]
    digital_assets: List[DigitalAsset]
    deductions_paid: dict = Field(default_factory=dict)
    dependents: int = 0
    w2_income: float = 0.0
    n1099_income: float = Field(0.0, alias="1099_income")
    capital_gains: float = 0.0

    class Config:
        allow_population_by_field_name = True

    @property
    def total_income(self) -> float:
        base = self.w2_income + self.n1099_income + self.capital_gains
        base += sum(asset.income_usd or 0.0 for asset in self.digital_assets)
        base += sum(entity.k1_box1 or 0.0 for entity in self.entities)
        return base

    @validator("filing_status")
    def _validate_status(cls, value: str) -> str:
        allowed = {"SINGLE", "MFJ", "MFS", "HOH", "QUALIFYING_WIDOW"}
        if value not in allowed:
            raise ValueError(f"Invalid filing_status '{value}'. Allowed: {sorted(allowed)}")
        return value

    @validator("state")
    def _validate_state(cls, value: str) -> str:
        if len(value) != 2:
            raise ValueError("state must be a two-letter abbreviation")
        return value.upper()


class Strategy(BaseModel):
    id: str
    name: str
    category: str
    eligibility: List[dict]
    calc: str
    outputs: List[str] = Field(default_factory=list)
    risk_score: int
    docs: List[str] = Field(default_factory=list)
    description: Optional[str] = None


class RuleLibrary(BaseModel):
    version: str
    released_at: Optional[str] = None
    strategies: List[Strategy]


class OptimizationResult(BaseModel):
    strategy_id: str
    name: str
    savings: float
    cash_outlay: float
    risk_score: int
    risk_adjusted_benefit: float
    audit_notes: List[str] = Field(default_factory=list)

