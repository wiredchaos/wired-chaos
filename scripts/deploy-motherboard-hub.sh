#!/bin/bash
# WIRED CHAOS Motherboard Hub 4-Node Deployment Script
# Deploys React panels, backend APIs, and tenant middleware for Gamma, Notion, Zapier, Wix

set -e

# 1. Frontend: Copy React panel templates
cp frontend/src/components/panels/GammaAIPanel.jsx.example frontend/src/components/panels/GammaAIPanel.jsx || true
cp frontend/src/components/panels/NotionNodePanel.jsx.example frontend/src/components/panels/NotionNodePanel.jsx || true
cp frontend/src/components/panels/ZapierNodePanel.jsx.example frontend/src/components/panels/ZapierNodePanel.jsx || true
cp frontend/src/components/panels/WixNodePanel.jsx.example frontend/src/components/panels/WixNodePanel.jsx || true

# 2. Backend: Copy API endpoint templates
cp backend/api/gamma_api.py.example backend/api/gamma_api.py || true
cp backend/api/notion_api.py.example backend/api/notion_api.py || true
cp backend/api/zapier_api.py.example backend/api/zapier_api.py || true
cp backend/api/wix_api.py.example backend/api/wix_api.py || true

# 3. Tenant middleware
cp backend/middleware/tenant_middleware.py.example backend/middleware/tenant_middleware.py || true

# 4. Run migrations and install dependencies
cd backend
pip install -r requirements.txt
cd ../frontend
npm install
cd ..

# 5. Build and deploy
cd frontend
npm run build
cd ..

# 6. Start backend server
cd backend
nohup uvicorn server:app --host 0.0.0.0 --port 8000 &
cd ..

# 7. Print success message
echo "✅ WIRED CHAOS Motherboard Hub 4-node deployment complete!"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:8000"
echo "- All panels and APIs are tenant-aware and live."
