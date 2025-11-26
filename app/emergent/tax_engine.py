"""Emergent runtime engine for the Wired Chaos tax suite."""
from __future__ import annotations

import datetime as dt
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from pymongo import MongoClient
from pymongo.errors import PyMongoError

from app.models.models import ClientProfile, OptimizationResult, RuleLibrary, Strategy
from app.utils.hash import sha256_dict
from app.utils.score import composite_score, normalize_scores

LOGGER = logging.getLogger(__name__)


FEDERAL_BRACKETS_2025 = [
    (0, 11000, 0.10),
    (11000, 44725, 0.12),
    (44725, 95375, 0.22),
    (95375, 182100, 0.24),
    (182100, 231250, 0.32),
    (231250, 578125, 0.35),
    (578125, None, 0.37),
]

STANDARD_DEDUCTION = {
    "SINGLE": 14600,
    "MFJ": 29200,
    "MFS": 14600,
    "HOH": 21900,
    "QUALIFYING_WIDOW": 29200,
}


class AuditVault:
    """Thin wrapper around MongoDB for audit logging."""

    def __init__(self, mongo_dsn: Optional[str] = None, database: str = "tax_audit") -> None:
        self._mongo_dsn = mongo_dsn
        self._database = database
        self._client: Optional[MongoClient] = None
        if mongo_dsn:
            try:
                self._client = MongoClient(mongo_dsn, serverSelectionTimeoutMS=2000)
                # Trigger connection test
                self._client.admin.command("ping")
            except Exception as exc:  # pragma: no cover - best effort connectivity
                LOGGER.warning("Failed to initialize MongoClient: %s", exc)
                self._client = None

    def log(self, document: Dict[str, Any]) -> None:
        if not self._client:
            LOGGER.debug("Audit log skipped (no Mongo client)")
            return
        try:
            collection = self._client[self._database]["audit_logs"]
            collection.insert_one(document)
        except PyMongoError as exc:  # pragma: no cover - runtime guard
            LOGGER.error("Failed to write audit log: %s", exc)


class TaxEngine:
    """Runtime orchestrator that combines codex knowledge with client data."""

    def __init__(
        self,
        rules_path: Path,
        state_pack_path: Path,
        audit_vault: Optional[AuditVault] = None,
    ) -> None:
        self.rules_path = rules_path
        self.state_pack_path = state_pack_path
        self.audit_vault = audit_vault or AuditVault()
        self.rule_library = self._load_rule_library(rules_path)
        self.state_pack = self._load_state_pack(state_pack_path)

    def _load_rule_library(self, path: Path) -> RuleLibrary:
        with path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
        return RuleLibrary(**payload)

    def _load_state_pack(self, path: Path) -> dict:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    def compute_baseline(self, profile: ClientProfile) -> Dict[str, Any]:
        agi = profile.total_income - sum(profile.deductions_paid.values())
        standard_deduction = STANDARD_DEDUCTION.get(profile.filing_status, 0)
        state_override = self.state_pack.get("standard_deduction", {}).get(profile.filing_status)
        deduction = max(standard_deduction, state_override or 0)
        taxable_income = max(agi - deduction, 0)
        federal_tax = self._progressive_tax(taxable_income)
        state_rate = 0.05
        state_tax = taxable_income * state_rate
        niit = max((profile.capital_gains - 250000), 0) * 0.038
        total_tax = federal_tax + state_tax + niit
        baseline = {
            "agi": agi,
            "deduction": deduction,
            "taxable_income": taxable_income,
            "federal_tax": federal_tax,
            "state_tax": state_tax,
            "niit": niit,
            "total_tax": total_tax,
        }
        LOGGER.debug("Baseline computed: %s", baseline)
        return baseline

    def _progressive_tax(self, taxable_income: float) -> float:
        tax = 0.0
        for lower, upper, rate in FEDERAL_BRACKETS_2025:
            if taxable_income <= lower:
                break
            upper_bound = upper if upper is not None else taxable_income
            taxable_at_rate = min(taxable_income, upper_bound) - lower
            if taxable_at_rate <= 0:
                continue
            tax += taxable_at_rate * rate
            if upper is None or taxable_income < upper:
                break
        return tax

    def filter_strategies(self, profile: ClientProfile) -> List[Strategy]:
        eligible = []
        for strategy in self.rule_library.strategies:
            if self._evaluate_eligibility(strategy, profile):
                eligible.append(strategy)
        return eligible

    def _evaluate_eligibility(self, strategy: Strategy, profile: ClientProfile) -> bool:
        # Placeholder rule interpreter using heuristics
        for clause in strategy.eligibility:
            expr = clause.get("expr", "")
            if expr == "hasEmployerPlan()" and profile.w2_income <= 0:
                return False
            if expr == "hasHDHP()" and "HSA" not in profile.deductions_paid:
                return False
            if expr == "hasPassThroughIncome()" and not profile.entities:
                return False
            if expr == "hasMultipleLots('crypto')":
                lots = sum(len(asset.lots) for asset in profile.digital_assets if asset.type != "ETF")
                if lots < 2:
                    return False
            if expr == "hasUnrealizedLosses('crypto')":
                if not any(asset.cost_basis and asset.proceeds and asset.cost_basis > asset.proceeds for asset in profile.digital_assets):
                    return False
            if expr == "hasStakingIncome()":
                if not any("stake" in (act.lower() for act in asset.activity) for asset in profile.digital_assets):
                    return False
            if expr == "entityType('S_Corp')":
                if not any(entity.type == "S_Corp" for entity in profile.entities):
                    return False
            if expr == "hasTaxDeferredAccounts()":
                if profile.deductions_paid.get("ira_contribution") is None:
                    return False
            if expr == "hasHighYieldETF()":
                if not any(asset.type == "ETF" for asset in profile.digital_assets):
                    return False
            if expr == "holds1256Contracts()":
                if not any(asset.type == "ETF" and "futures" in (act.lower() for act in asset.activity) for asset in profile.digital_assets):
                    return False
            if expr == "stateAllowsPTET()" and not self.state_pack.get("ptet", {}).get("available"):
                return False
            if expr == "saltCapBinding()" and profile.deductions_paid.get("state_tax_paid", 0) < 10000:
                return False
        return True

    def optimize(self, profile: ClientProfile) -> Dict[str, Any]:
        baseline = self.compute_baseline(profile)
        eligible_strategies = self.filter_strategies(profile)
        evaluated = [
            self._simulate_strategy(strategy, profile, baseline)
            for strategy in eligible_strategies
        ]
        ranked = normalize_scores([result.dict() for result in evaluated])
        calc_id = sha256_dict({"timestamp": dt.datetime.utcnow().isoformat(), "profile": profile.dict(by_alias=True)})
        audit_payload = {
            "calc_id": calc_id,
            "inputs_hash": sha256_dict(profile.dict(by_alias=True)),
            "result_hash": sha256_dict({"baseline": baseline, "ranked": ranked}),
            "codex_version": self.rule_library.version,
            "emergent_version": "1.0.0",
            "timestamp": dt.datetime.utcnow().isoformat(),
        }
        self.audit_vault.log(audit_payload)
        return {
            "calc_id": calc_id,
            "baseline": baseline,
            "strategies": ranked,
        }

    def _simulate_strategy(
        self, strategy: Strategy, profile: ClientProfile, baseline: Dict[str, Any]
    ) -> OptimizationResult:
        savings = self._estimate_savings(strategy, profile, baseline)
        cash_outlay = self._estimate_cash_outlay(strategy, profile)
        risk_adjusted = composite_score(savings, strategy.risk_score, cash_outlay)
        audit_notes = [f"Documentation required: {', '.join(strategy.docs)}"] if strategy.docs else []
        return OptimizationResult(
            strategy_id=strategy.id,
            name=strategy.name,
            savings=savings,
            cash_outlay=cash_outlay,
            risk_score=strategy.risk_score,
            risk_adjusted_benefit=risk_adjusted,
            audit_notes=audit_notes,
        )

    def _estimate_savings(self, strategy: Strategy, profile: ClientProfile, baseline: Dict[str, Any]) -> float:
        taxable_income = baseline["taxable_income"]
        if strategy.category == "Traditional":
            return min(22500, taxable_income * 0.05)
        if strategy.category == "Entity":
            return sum(entity.k1_box1 or 0 for entity in profile.entities) * 0.2
        if strategy.category.startswith("Crypto"):
            return sum(max(asset.cost_basis - (asset.proceeds or asset.cost_basis), 0) for asset in profile.digital_assets) * 0.3 + 1500
        if strategy.category.startswith("ETF"):
            return 1200.0
        if strategy.category == "State Planning":
            return min(profile.deductions_paid.get("state_tax_paid", 0) * 0.9, 10000)
        if strategy.category == "Compliance":
            return 250.0
        return 0.0

    def _estimate_cash_outlay(self, strategy: Strategy, profile: ClientProfile) -> float:
        if strategy.category == "Charitable":
            return sum(profile.deductions_paid.get(k, 0) for k in ("charity_cash",))
        if strategy.category == "Education":
            return 15000.0
        return 0.0


def load_engine(base_path: Optional[Path] = None, mongo_dsn: Optional[str] = None) -> TaxEngine:
    base = base_path or Path(__file__).resolve().parents[1]
    rules = base / "codex" / "tax_suite" / "rules" / "rules.bundle.v1.json"
    state_pack = base / "codex" / "tax_suite" / "statepacks" / "CA.statepack.json"
    audit = AuditVault(mongo_dsn=mongo_dsn)
    return TaxEngine(rules_path=rules, state_pack_path=state_pack, audit_vault=audit)


