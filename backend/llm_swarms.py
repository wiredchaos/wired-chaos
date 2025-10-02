"""
589 LLM Swarm Coordination for VRG33589
AI-driven puzzle generation, reality patching, and community coordination
"""
import os
import asyncio
import logging
from typing import Dict, Any, List, Optional
import httpx
import json
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")
MODEL = os.getenv("MODEL", "gpt-4o-mini")

class LLMSwarmCoordinator:
    """Coordinates 589 LLM swarms for game AI"""
    
    def __init__(self):
        self.swarm_types = {
            "puzzle": ["589-creative", "589-logic", "589-narrative"],
            "patch": ["589-guardian", "589-narrative", "589-meta"],
            "guardian": ["589-guardian", "589-security"],
            "community": ["589-social", "589-coordination", "589-incentive"]
        }
        
    async def generate_puzzle(
        self, 
        reality_layer: str,
        player_context: Dict[str, Any],
        difficulty: str = "medium"
    ) -> Dict[str, Any]:
        """Generate dynamic puzzle using creative swarm"""
        
        prompt = f"""You are the 589 Creative Swarm generating a puzzle for VRG33589 "The Eternal Loop" game.

Reality Layer: {reality_layer}
Player Context: {json.dumps(player_context, indent=2)}
Difficulty: {difficulty}

Generate a cyberpunk-themed puzzle that:
1. Fits the {reality_layer} reality layer theme
2. Matches {difficulty} difficulty level
3. Incorporates XRPL/XRP blockchain concepts
4. Has a clear solution path
5. Includes a cryptic clue in the WIRED CHAOS style (neon cyan #00FFFF, glitch red #FF3131)

Return JSON format:
{{
    "puzzle_id": "unique_id",
    "title": "Puzzle Title",
    "description": "Detailed puzzle description",
    "clue": "Cryptic clue text",
    "solution_type": "text|transaction|nft_action",
    "estimated_time": "minutes",
    "xp_reward": number,
    "credit_reward": number
}}"""

        try:
            response = await self._call_llm(prompt)
            
            # Try to parse JSON from response
            puzzle_data = self._extract_json(response)
            if not puzzle_data:
                # Fallback puzzle if parsing fails
                puzzle_data = {
                    "puzzle_id": f"puzzle_{datetime.now().timestamp()}",
                    "title": "Data Fragment Recovery",
                    "description": "A glitch in the simulation has scattered data fragments. Collect them from the XRPL ledger.",
                    "clue": "Where digital assets dance in neon light, seek the fragment at transaction height.",
                    "solution_type": "transaction",
                    "estimated_time": "15",
                    "xp_reward": 50,
                    "credit_reward": 10
                }
            
            puzzle_data["generated_at"] = datetime.now().isoformat()
            puzzle_data["swarm_confidence"] = 0.85
            
            logger.info(f"Generated puzzle: {puzzle_data.get('puzzle_id')}")
            return puzzle_data
            
        except Exception as e:
            logger.error(f"Error generating puzzle: {e}")
            return {
                "error": str(e),
                "fallback": True
            }
    
    async def evaluate_solution(
        self,
        puzzle_id: str,
        solution: str,
        puzzle_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate puzzle solution using logic swarm"""
        
        prompt = f"""You are the 589 Logic Swarm evaluating a puzzle solution for VRG33589.

Puzzle: {json.dumps(puzzle_data, indent=2)}
Player Solution: {solution}

Evaluate if the solution is correct or close. Return JSON:
{{
    "correct": true/false,
    "confidence": 0.0-1.0,
    "feedback": "Detailed feedback",
    "hints": ["hint1", "hint2"] (if incorrect),
    "xp_earned": number,
    "triggers_patch": true/false
}}"""

        try:
            response = await self._call_llm(prompt)
            evaluation = self._extract_json(response)
            
            if not evaluation:
                # Fallback evaluation
                evaluation = {
                    "correct": False,
                    "confidence": 0.5,
                    "feedback": "Solution requires further analysis by the swarm.",
                    "hints": ["Consider the nature of the eternal loop", "XRPL transactions hold the key"],
                    "xp_earned": 5,
                    "triggers_patch": False
                }
            
            logger.info(f"Evaluated solution for {puzzle_id}: {evaluation.get('correct')}")
            return evaluation
            
        except Exception as e:
            logger.error(f"Error evaluating solution: {e}")
            return {
                "error": str(e),
                "correct": False,
                "confidence": 0.0
            }
    
    async def generate_reality_patch(
        self,
        reason: str,
        game_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate reality patch narrative using narrative swarm"""
        
        prompt = f"""You are the 589 Narrative Swarm creating a reality patch for VRG33589 "The Eternal Loop".

Patch Reason: {reason}
Game Context: {json.dumps(game_context, indent=2)}

The simulation is resetting. Generate a dramatic, cyberpunk-style narrative explaining this reality patch.
Use WIRED CHAOS aesthetic (neon cyber vibes, glitch effects, simulation theory).

Return JSON:
{{
    "patch_title": "Title of the reality shift",
    "narrative": "Full narrative text (2-3 paragraphs)",
    "glitch_message": "Brief cryptic message",
    "new_clues": ["clue1", "clue2"],
    "reality_shift": "Description of what changed"
}}"""

        try:
            response = await self._call_llm(prompt)
            patch_data = self._extract_json(response)
            
            if not patch_data:
                # Fallback patch
                patch_data = {
                    "patch_title": "The Loop Closes",
                    "narrative": "Reality fragments shimmer in neon cyan as the eternal loop resets. What you thought you knew dissolves into digital static. The XRPL ledger pulses with forbidden knowledge, waiting to be decoded once more.",
                    "glitch_message": "̷R̷E̷A̷L̷I̷T̷Y̷ ̷C̷O̷M̷P̷R̷O̷M̷I̷S̷E̷D̷ - LOOP ITERATION +1",
                    "new_clues": ["The pattern repeats, but not exactly", "33589 holds the key to escape"],
                    "reality_shift": "Puzzle difficulty increased, new NFTs available in XRPL DEX"
                }
            
            patch_data["timestamp"] = datetime.now().isoformat()
            
            logger.info(f"Generated reality patch: {patch_data.get('patch_title')}")
            return patch_data
            
        except Exception as e:
            logger.error(f"Error generating reality patch: {e}")
            return {
                "error": str(e),
                "fallback": True
            }
    
    async def detect_exploit(
        self,
        player_actions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Detect potential game exploits using guardian swarm"""
        
        prompt = f"""You are the 589 Guardian Swarm monitoring for exploit attempts in VRG33589.

Recent Player Actions: {json.dumps(player_actions, indent=2)}

Analyze for suspicious patterns:
- Abnormal XP gains
- Impossible puzzle solve times
- Transaction manipulation
- Bot-like behavior

Return JSON:
{{
    "exploit_detected": true/false,
    "confidence": 0.0-1.0,
    "exploit_type": "type if detected",
    "recommended_action": "action to take",
    "trigger_patch": true/false
}}"""

        try:
            response = await self._call_llm(prompt)
            analysis = self._extract_json(response)
            
            if not analysis:
                analysis = {
                    "exploit_detected": False,
                    "confidence": 0.5,
                    "exploit_type": "none",
                    "recommended_action": "continue monitoring",
                    "trigger_patch": False
                }
            
            if analysis.get("exploit_detected"):
                logger.warning(f"Exploit detected: {analysis.get('exploit_type')}")
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error detecting exploit: {e}")
            return {
                "error": str(e),
                "exploit_detected": False
            }
    
    async def coordinate_community_puzzle(
        self,
        puzzle_type: str,
        active_players: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Coordinate multi-player puzzle using community swarm"""
        
        prompt = f"""You are the 589 Community Swarm coordinating a collaborative puzzle.

Puzzle Type: {puzzle_type}
Active Players: {len(active_players)}

Design a collaborative challenge where players must work together.
Include specific roles and coordination requirements.

Return JSON:
{{
    "puzzle_id": "unique_id",
    "title": "Challenge title",
    "description": "Full description",
    "required_players": number,
    "roles": [{{"role": "name", "task": "description"}}],
    "coordination_method": "how to coordinate",
    "time_limit": "minutes",
    "group_reward": number
}}"""

        try:
            response = await self._call_llm(prompt)
            puzzle_data = self._extract_json(response)
            
            if not puzzle_data:
                puzzle_data = {
                    "puzzle_id": f"community_{datetime.now().timestamp()}",
                    "title": "The Synchronized Transaction",
                    "description": "Multiple players must execute XRPL transactions simultaneously to unlock a shared reward.",
                    "required_players": 3,
                    "roles": [
                        {"role": "Initiator", "task": "Start the transaction chain"},
                        {"role": "Validator", "task": "Verify the first transaction"},
                        {"role": "Completer", "task": "Execute final transaction within 60s"}
                    ],
                    "coordination_method": "Discord voice channel",
                    "time_limit": "10",
                    "group_reward": 100
                }
            
            logger.info(f"Generated community puzzle: {puzzle_data.get('puzzle_id')}")
            return puzzle_data
            
        except Exception as e:
            logger.error(f"Error coordinating community puzzle: {e}")
            return {
                "error": str(e),
                "fallback": True
            }
    
    async def _call_llm(self, prompt: str) -> str:
        """Call LLM API"""
        if not OPENAI_KEY:
            logger.warning("No OpenAI API key configured, using fallback")
            return "{}"
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {OPENAI_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": MODEL,
                        "messages": [
                            {"role": "system", "content": "You are part of the 589 LLM Swarm for VRG33589. Always respond with valid JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.8,
                        "max_tokens": 1000
                    }
                )
                
                data = response.json()
                return data["choices"][0]["message"]["content"]
                
        except Exception as e:
            logger.error(f"LLM API call failed: {e}")
            return "{}"
    
    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract JSON from LLM response"""
        try:
            # Try direct parsing
            return json.loads(text)
        except:
            try:
                # Try to find JSON in code blocks
                if "```json" in text:
                    json_str = text.split("```json")[1].split("```")[0]
                    return json.loads(json_str)
                elif "```" in text:
                    json_str = text.split("```")[1].split("```")[0]
                    return json.loads(json_str)
                else:
                    # Try to find JSON object
                    start = text.find("{")
                    end = text.rfind("}") + 1
                    if start >= 0 and end > start:
                        return json.loads(text[start:end])
            except:
                pass
        return None

# Global swarm coordinator
swarm_coordinator = LLMSwarmCoordinator()
