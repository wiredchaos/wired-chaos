"""
SWARM Grant Bot - Package Initialization

Next-generation grant automation system with full-cycle support.
"""

__version__ = "1.0.0"
__author__ = "WIRED CHAOS Team"

from .config import get_config
from .sources import SourceManager
from .nlp import ProfileMatcher, EligibilityFilter, GrantPrioritizer
from .automation import ApplicationDrafter, SubmissionHandler, StatusMonitor, BlockchainLogger
from .gamma import PitchGenerator, ExecutiveSummary

__all__ = [
    "get_config",
    "SourceManager",
    "ProfileMatcher",
    "EligibilityFilter",
    "GrantPrioritizer",
    "ApplicationDrafter",
    "SubmissionHandler",
    "StatusMonitor",
    "BlockchainLogger",
    "PitchGenerator",
    "ExecutiveSummary",
    "GrantBot",
]


class GrantBot:
    """
    Main Grant Bot orchestrator
    
    Combines all modules into a unified interface for grant automation.
    """
    
    def __init__(self, tenant_id: str = "default", config_path: str = None):
        """
        Initialize Grant Bot
        
        Args:
            tenant_id: Tenant identifier
            config_path: Path to config file (optional)
        """
        # Load configuration
        self.config = get_config()
        self.tenant_id = tenant_id
        
        # Initialize modules
        self.source_manager = SourceManager(
            rss_feeds=self.config.sources.grant_rss_feeds,
            api_keys=self.config.sources.grants_api_keys,
            swarm_feed_url=self.config.sources.swarm_rss_feed_url,
            tenant_id=tenant_id
        )
        
        org_profile = {
            'name': tenant_id,
            'tags': self.config.organization.org_tags,
            'legal_structure': self.config.organization.org_legal_structure,
            'location': self.config.organization.org_location,
            'size': self.config.organization.org_size,
        }
        
        self.profile_matcher = ProfileMatcher(org_profile)
        self.eligibility_filter = EligibilityFilter(org_profile)
        self.prioritizer = GrantPrioritizer()
        
        self.drafter = ApplicationDrafter(
            org_profile=org_profile,
            openai_api_key=self.config.nlp.openai_api_key,
            model=self.config.nlp.nlp_model
        )
        
        self.submission_handler = SubmissionHandler(
            test_mode=self.config.development.test_mode
        )
        
        self.status_monitor = StatusMonitor(
            notification_email=self.config.automation.notification_email
        )
        
        self.blockchain_logger = BlockchainLogger(
            network=self.config.blockchain.blockchain_network,
            rpc_url=self.config.blockchain.blockchain_rpc_url,
            private_key=self.config.blockchain.blockchain_private_key,
            contract_address=self.config.blockchain.audit_contract_address
        )
        
        self.pitch_generator = PitchGenerator(
            api_key=self.config.gamma.gamma_api_key,
            workspace_id=self.config.gamma.gamma_workspace_id,
            template_id=self.config.gamma.gamma_pitch_template_id
        )
        
        self.executive_summary = ExecutiveSummary(
            api_key=self.config.gamma.gamma_api_key,
            workspace_id=self.config.gamma.gamma_workspace_id,
            template_id=self.config.gamma.gamma_exec_summary_template_id
        )
    
    async def discover_grants(self, use_cache: bool = False):
        """Discover all grants from configured sources"""
        grants = await self.source_manager.discover_all_grants(use_cache=use_cache)
        await self.blockchain_logger.log_discovery(grants)
        return grants
    
    async def filter_eligible(self, grants):
        """Filter grants for eligibility"""
        eligible = self.eligibility_filter.filter_grants(grants)
        
        # Log eligibility checks
        for grant in eligible:
            await self.blockchain_logger.log_eligibility_check(
                grant_id=grant.get('grant_id', grant.get('title', '')),
                is_eligible=True,
                match_score=grant['match_score']
            )
        
        return eligible
    
    async def prioritize_grants(self, grants):
        """Prioritize grants by multiple factors"""
        return self.prioritizer.prioritize_grants(grants)
    
    async def draft_application(self, grant, use_llm: bool = False):
        """Draft grant application"""
        application = await self.drafter.draft_application(grant, use_llm=use_llm)
        
        await self.blockchain_logger.log_application_draft(
            grant_id=grant.get('grant_id', grant.get('title', '')),
            application_id=application.get('grant_id', 'UNKNOWN')
        )
        
        return application
    
    async def generate_pitch_deck(self, grant, application):
        """Generate pitch deck for grant"""
        org_profile = {
            'name': self.tenant_id,
            'tags': self.config.organization.org_tags,
        }
        return await self.pitch_generator.generate_pitch_deck(grant, application, org_profile)
    
    async def submit_application(self, grant, application, method: str = "api"):
        """Submit grant application"""
        result = await self.submission_handler.submit_application(grant, application, method)
        
        if result.get('success'):
            await self.blockchain_logger.log_submission(
                grant_id=grant.get('grant_id', ''),
                submission_id=result['submission_id'],
                method=method
            )
            
            # Start tracking
            await self.status_monitor.track_application(result)
        
        return result
    
    async def check_status(self, submission_id: str):
        """Check application status"""
        return await self.status_monitor.check_status(submission_id)
    
    def get_stats(self):
        """Get comprehensive bot statistics"""
        return {
            'sources': self.source_manager.get_source_stats(),
            'submissions': self.submission_handler.get_submission_stats(),
            'tracking': self.status_monitor.get_tracking_stats(),
        }
