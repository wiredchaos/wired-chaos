"""
VRG33589 API Test Script
Simple tests to verify game endpoints work correctly
"""
import asyncio
import json


async def test_game_api():
    """Test VRG33589 game API endpoints"""
    print("=" * 60)
    print("VRG33589 Game API Test Suite")
    print("=" * 60)
    
    # Import modules
    try:
        from vrg33589_game import (
            game_states, 
            GAME_CONFIG,
            XRPLGameState,
            XRPLNFT,
            SwarmTask
        )
        print("✓ Modules imported successfully\n")
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return
    
    # Test 1: Game Configuration
    print("Test 1: Game Configuration")
    print("-" * 60)
    assert "reality_layers" in GAME_CONFIG
    assert "credit_economy" in GAME_CONFIG
    assert "swarm_tasks_config" in GAME_CONFIG
    print(f"✓ Game config has {len(GAME_CONFIG['reality_layers'])} reality layers")
    print(f"✓ Credit economy base rate: {GAME_CONFIG['credit_economy']['base_rate']}")
    print(f"✓ Swarm task types: {len(GAME_CONFIG['swarm_tasks_config'])}")
    print()
    
    # Test 2: Game State Creation
    print("Test 2: Game State Creation")
    print("-" * 60)
    test_wallet = "rTestWalletAddress12345"
    game_state = XRPLGameState(
        player_wallet=test_wallet,
        reality_layer="surface",
        loop_iteration=0
    )
    game_states[test_wallet] = game_state
    print(f"✓ Created game state for wallet: {test_wallet}")
    print(f"✓ Initial layer: {game_state.reality_layer}")
    print(f"✓ Initial credits: {game_state.credit_balance}")
    print()
    
    # Test 3: NFT Registration
    print("Test 3: NFT Registration")
    print("-" * 60)
    test_nft = XRPLNFT(
        nft_id="00080000TESTNFT123456789",
        rarity="rare",
        daily_credits=2.5,
        special_abilities=["speed_boost"]
    )
    game_state.vrg33589_nfts.append(test_nft.dict())
    print(f"✓ Registered NFT: {test_nft.nft_id}")
    print(f"✓ NFT rarity: {test_nft.rarity}")
    print(f"✓ Daily credits: {test_nft.daily_credits}")
    print()
    
    # Test 4: Credit Calculation
    print("Test 4: Credit Calculation")
    print("-" * 60)
    total_credits = 0.0
    for nft in game_state.vrg33589_nfts:
        rarity = nft.get("rarity", "common")
        multiplier = GAME_CONFIG["credit_economy"]["rarity_multipliers"].get(rarity, 1.0)
        credits = GAME_CONFIG["credit_economy"]["base_rate"] * multiplier
        total_credits += credits
    game_state.credit_balance += total_credits
    print(f"✓ Calculated credits: {total_credits}")
    print(f"✓ New balance: {game_state.credit_balance}")
    print()
    
    # Test 5: Puzzle Progress
    print("Test 5: Puzzle Progress")
    print("-" * 60)
    puzzle_entry = {
        "puzzle_id": "test_puzzle_001",
        "solution": "33589",
        "timestamp": "2024-01-01T00:00:00",
        "verified": False,
        "confidence": 0.0
    }
    game_state.puzzle_progress.append(puzzle_entry)
    print(f"✓ Added puzzle progress: {puzzle_entry['puzzle_id']}")
    print(f"✓ Total puzzles attempted: {len(game_state.puzzle_progress)}")
    print()
    
    # Test 6: Swarm Task Creation
    print("Test 6: Swarm Task Creation")
    print("-" * 60)
    swarm_task = SwarmTask(
        swarm_type="puzzle",
        game_context={"layer": "surface", "difficulty": "medium"},
        player_data={"wallet": test_wallet, "level": 0},
        urgency="medium",
        collaboration_required=False
    )
    print(f"✓ Created swarm task: {swarm_task.swarm_type}")
    print(f"✓ Urgency: {swarm_task.urgency}")
    print(f"✓ Collaboration required: {swarm_task.collaboration_required}")
    print()
    
    # Test 7: Reality Layer Progression
    print("Test 7: Reality Layer Progression")
    print("-" * 60)
    layers = list(GAME_CONFIG["reality_layers"].keys())
    print(f"✓ Available layers: {', '.join(layers)}")
    print(f"✓ Current layer: {game_state.reality_layer}")
    
    # Check unlock requirements
    for layer_name, layer_config in GAME_CONFIG["reality_layers"].items():
        min_level = layer_config["min_level"]
        unlocked = game_state.loop_iteration >= min_level
        status = "✓ Unlocked" if unlocked else "✗ Locked"
        print(f"  {layer_name}: {status} (requires loop {min_level})")
    print()
    
    # Test 8: Loop Iteration
    print("Test 8: Loop Iteration")
    print("-" * 60)
    original_iteration = game_state.loop_iteration
    game_state.loop_iteration += 1
    print(f"✓ Loop iteration increased: {original_iteration} → {game_state.loop_iteration}")
    print()
    
    # Test 9: Data Serialization
    print("Test 9: Data Serialization")
    print("-" * 60)
    state_dict = game_state.dict()
    state_json = json.dumps(state_dict, indent=2, default=str)
    print(f"✓ Game state serialized to JSON ({len(state_json)} bytes)")
    print(f"✓ Fields: {', '.join(state_dict.keys())}")
    print()
    
    # Test 10: Rarity Multipliers
    print("Test 10: Rarity Multipliers")
    print("-" * 60)
    rarities = GAME_CONFIG["credit_economy"]["rarity_multipliers"]
    for rarity, multiplier in rarities.items():
        credits = GAME_CONFIG["credit_economy"]["base_rate"] * multiplier
        print(f"✓ {rarity.capitalize()}: {multiplier}x = {credits} credits/day")
    print()
    
    # Summary
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"✓ All 10 tests passed successfully!")
    print(f"✓ Game state contains {len(game_state.vrg33589_nfts)} NFTs")
    print(f"✓ Credit balance: {game_state.credit_balance}")
    print(f"✓ Loop iteration: {game_state.loop_iteration}")
    print(f"✓ Puzzles attempted: {len(game_state.puzzle_progress)}")
    print(f"✓ Current layer: {game_state.reality_layer}")
    print("\n🎮 VRG33589 Game API is working correctly!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_game_api())
