"""
SWARM Grant Bot - Configuration Management

Central configuration for the grant bot system.
Loads environment variables and provides typed configuration objects.
"""

import json
import os
from typing import Dict, List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class GrantSourcesConfig(BaseSettings):
    """Configuration for grant source discovery"""
    
    swarm_rss_feed_url: str = Field(
        default="https://twitter.com/swarm/rss",
        description="X SWARM RSS feed URL for Web3 grants"
    )
    grants_api_keys: Dict[str, str] = Field(
        default_factory=dict,
        description="API keys for various grant databases"
    )
    grant_rss_feeds: List[str] = Field(
        default_factory=list,
        description="Additional RSS feed URLs"
    )
    grants_gov_api_key: Optional[str] = Field(
        default=None,
        description="Grants.gov API key"
    )
    foundation_center_api_key: Optional[str] = Field(
        default=None,
        description="Foundation Center API key"
    )
    
    class Config:
        env_file = ".env"


class NLPConfig(BaseSettings):
    """Configuration for NLP and LLM services"""
    
    openai_api_key: Optional[str] = Field(
        default=None,
        description="OpenAI API key for NLP and drafting"
    )
    nlp_model: str = Field(
        default="gpt-4o-mini",
        description="LLM model for application writing"
    )
    embedding_model: str = Field(
        default="text-embedding-3-small",
        description="Embedding model for semantic matching"
    )
    
    class Config:
        env_file = ".env"


class BlockchainConfig(BaseSettings):
    """Configuration for blockchain audit logging"""
    
    blockchain_network: str = Field(
        default="ethereum",
        description="Blockchain network for audit logs"
    )
    blockchain_rpc_url: Optional[str] = Field(
        default=None,
        description="RPC URL for blockchain transactions"
    )
    blockchain_private_key: Optional[str] = Field(
        default=None,
        description="Private key for blockchain logging"
    )
    audit_contract_address: Optional[str] = Field(
        default=None,
        description="Contract address for grant audit logs"
    )
    
    class Config:
        env_file = ".env"


class GammaConfig(BaseSettings):
    """Configuration for Gamma integration"""
    
    gamma_api_key: Optional[str] = Field(
        default=None,
        description="Gamma API key"
    )
    gamma_workspace_id: Optional[str] = Field(
        default=None,
        description="Gamma workspace ID"
    )
    gamma_pitch_template_id: Optional[str] = Field(
        default=None,
        description="Template ID for pitch decks"
    )
    gamma_exec_summary_template_id: Optional[str] = Field(
        default=None,
        description="Template ID for executive summaries"
    )
    
    class Config:
        env_file = ".env"


class TenantConfig(BaseSettings):
    """Configuration for multi-tenant support"""
    
    tenant_database_url: str = Field(
        default="mongodb://localhost:27017/grants_bot",
        description="Database URL for tenant management"
    )
    default_tenant_id: str = Field(
        default="wired-chaos",
        description="Default tenant ID"
    )
    sso_provider: Optional[str] = Field(
        default=None,
        description="SSO provider name"
    )
    sso_client_id: Optional[str] = Field(
        default=None,
        description="SSO client ID"
    )
    sso_client_secret: Optional[str] = Field(
        default=None,
        description="SSO client secret"
    )
    
    class Config:
        env_file = ".env"


class OrganizationConfig(BaseSettings):
    """Configuration for organization profile"""
    
    org_tags: List[str] = Field(
        default=["web3", "women", "woman-owned", "tech", "nonprofit", "blockchain", "ai"],
        description="Organization tags for grant matching"
    )
    org_legal_structure: str = Field(
        default="LLC",
        description="Organization legal structure"
    )
    org_size: str = Field(
        default="small",
        description="Organization size"
    )
    org_location: str = Field(
        default="United States",
        description="Organization location"
    )
    
    class Config:
        env_file = ".env"


class AutomationConfig(BaseSettings):
    """Configuration for automation settings"""
    
    discovery_interval_hours: int = Field(
        default=24,
        description="Hours between auto-discovery runs"
    )
    auto_submit_enabled: bool = Field(
        default=False,
        description="Enable automatic application submission"
    )
    notification_email: Optional[str] = Field(
        default=None,
        description="Email for status notifications"
    )
    discord_webhook_url: Optional[str] = Field(
        default=None,
        description="Discord webhook for notifications"
    )
    
    class Config:
        env_file = ".env"


class APIConfig(BaseSettings):
    """Configuration for API server"""
    
    api_host: str = Field(
        default="0.0.0.0",
        description="API server host"
    )
    api_port: int = Field(
        default=8001,
        description="API server port"
    )
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "https://wired-chaos.pages.dev"],
        description="Allowed CORS origins"
    )
    jwt_secret: Optional[str] = Field(
        default=None,
        description="JWT secret for authentication"
    )
    
    class Config:
        env_file = ".env"


class EducationConfig(BaseSettings):
    """Configuration for educational module"""
    
    edu_module_enabled: bool = Field(
        default=True,
        description="Enable educational module"
    )
    edu_content_url: str = Field(
        default="/university/edu/grants-for-founders",
        description="Course content URL"
    )
    upsell_strategy_url: str = Field(
        default="/contact?service=grant-strategy",
        description="Upsell URL for strategy consulting"
    )
    upsell_swarm_url: str = Field(
        default="/vsp?package=enterprise",
        description="Upsell URL for SWARM automation"
    )
    upsell_wl_url: str = Field(
        default="/b2b?solution=white-label",
        description="Upsell URL for white-label solution"
    )
    
    class Config:
        env_file = ".env"


class DevelopmentConfig(BaseSettings):
    """Configuration for development settings"""
    
    debug: bool = Field(
        default=False,
        description="Debug mode"
    )
    log_level: str = Field(
        default="INFO",
        description="Logging level"
    )
    test_mode: bool = Field(
        default=True,
        description="Test mode (skip actual submissions)"
    )
    
    class Config:
        env_file = ".env"


class GrantBotConfig(BaseSettings):
    """Main configuration object combining all settings"""
    
    sources: GrantSourcesConfig = Field(default_factory=GrantSourcesConfig)
    nlp: NLPConfig = Field(default_factory=NLPConfig)
    blockchain: BlockchainConfig = Field(default_factory=BlockchainConfig)
    gamma: GammaConfig = Field(default_factory=GammaConfig)
    tenant: TenantConfig = Field(default_factory=TenantConfig)
    organization: OrganizationConfig = Field(default_factory=OrganizationConfig)
    automation: AutomationConfig = Field(default_factory=AutomationConfig)
    api: APIConfig = Field(default_factory=APIConfig)
    education: EducationConfig = Field(default_factory=EducationConfig)
    development: DevelopmentConfig = Field(default_factory=DevelopmentConfig)
    
    class Config:
        env_file = ".env"
    
    @classmethod
    def load(cls) -> "GrantBotConfig":
        """Load configuration from environment"""
        return cls(
            sources=GrantSourcesConfig(),
            nlp=NLPConfig(),
            blockchain=BlockchainConfig(),
            gamma=GammaConfig(),
            tenant=TenantConfig(),
            organization=OrganizationConfig(),
            automation=AutomationConfig(),
            api=APIConfig(),
            education=EducationConfig(),
            development=DevelopmentConfig(),
        )


# Singleton configuration instance
_config: Optional[GrantBotConfig] = None


def get_config() -> GrantBotConfig:
    """Get or create the configuration singleton"""
    global _config
    if _config is None:
        _config = GrantBotConfig.load()
    return _config
