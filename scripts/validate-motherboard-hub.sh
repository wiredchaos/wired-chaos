#!/bin/bash
# WIRED CHAOS Motherboard Hub Validation Script
# Validates tenant isolation, API health, and cross-node integration

set -e

# 1. Check backend API health
curl -sf http://localhost:8000/api/gamma/status && echo "Gamma API OK" || echo "Gamma API FAIL"
curl -sf http://localhost:8000/api/notion/status && echo "Notion API OK" || echo "Notion API FAIL"
curl -sf http://localhost:8000/api/zapier/status && echo "Zapier API OK" || echo "Zapier API FAIL"
curl -sf http://localhost:8000/api/wix/status && echo "Wix API OK" || echo "Wix API FAIL"

# 2. Test tenant isolation (business)
RESPONSE=$(curl -s -H "X-Tenant: business" http://localhost:8000/api/gamma/status)
echo "$RESPONSE" | grep 'business' && echo "Business tenant isolation OK" || echo "Business tenant isolation FAIL"

# 3. Test tenant isolation (school)
RESPONSE=$(curl -s -H "X-Tenant: school" http://localhost:8000/api/gamma/status)
echo "$RESPONSE" | grep 'school' && echo "School tenant isolation OK" || echo "School tenant isolation FAIL"

# 4. Cross-node integration test (Gamma triggers Notion)
curl -sf -X POST http://localhost:8000/api/gamma/trigger -H "Content-Type: application/json" -d '{"pipeline_type":"sync_notion"}' && echo "Gamma→Notion integration OK" || echo "Gamma→Notion integration FAIL"

# 5. Print summary
echo "✅ Validation complete. Review results above."
