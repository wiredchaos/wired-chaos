#!/bin/bash
# SWARM Canary Rollout Script
# Usage: ./swarm_canary_rollout.sh <percentage>

PERCENTAGE=${1:-10}

echo "Starting canary rollout: $PERCENTAGE% of production traffic..."
# Insert your deployment CLI or API call here, e.g.:
# vercel deploy --prod --percent=$PERCENTAGE
# cloudflare deploy --canary $PERCENTAGE
# ...
echo "Canary rollout triggered. Monitor telemetry for anomalies."
