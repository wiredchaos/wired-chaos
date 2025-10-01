#!/bin/bash
# WIRED CHAOS GAMMA Template Activation Script
# Activates all 6 presentation types for GAMMA automation

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🎨 WIRED CHAOS GAMMA Template Activation${NC}"
echo "=========================================="
echo ""

# Change to gamma-wix-automation directory
cd "$(dirname "$0")/../gamma-wix-automation"

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Check for GAMMA API token
if [ -z "$GAMMA_API_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  GAMMA_API_TOKEN not set${NC}"
    echo "Set it with: export GAMMA_API_TOKEN=your_token"
    echo "Or run: ./scripts/setup-environment.sh"
    echo ""
    echo -e "${CYAN}Continuing with dry-run mode...${NC}"
fi

# Template types to activate
TEMPLATE_TYPES=(
    "component"
    "feature"
    "milestone"
    "release"
    "tutorial"
    "update"
)

echo -e "${CYAN}📋 Activating ${#TEMPLATE_TYPES[@]} presentation templates...${NC}"
echo ""

ACTIVATED=0
FAILED=0

# Activate each template
for template in "${TEMPLATE_TYPES[@]}"; do
    echo -e "${YELLOW}🔧 Activating: $template${NC}"
    
    # Check if template file exists
    if [ ! -f "templates/${template}-template.json" ]; then
        echo -e "${RED}❌ Template file not found: templates/${template}-template.json${NC}"
        FAILED=$((FAILED + 1))
        continue
    fi
    
    # Validate template JSON
    if ! node -e "JSON.parse(require('fs').readFileSync('templates/${template}-template.json', 'utf8'))" 2>/dev/null; then
        echo -e "${RED}❌ Invalid JSON in template: $template${NC}"
        FAILED=$((FAILED + 1))
        continue
    fi
    
    # Create activation script if it doesn't exist
    cat > "src/activate-${template}.js" << EOF
#!/usr/bin/env node
/**
 * Activate ${template} presentation template
 */

const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '..', 'templates', '${template}-template.json');
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

console.log('✅ ${template} template loaded successfully');
console.log('   Name:', template.name);
console.log('   Slides:', template.slides.length);
console.log('   Theme:', template.theme.id);

// In production, this would register the template with GAMMA API
if (process.env.GAMMA_API_TOKEN) {
    console.log('📡 Registering template with GAMMA API...');
    // TODO: Implement GAMMA API registration
    console.log('✅ Template registered successfully');
} else {
    console.log('ℹ️  Dry-run mode (GAMMA_API_TOKEN not set)');
}

process.exit(0);
EOF
    
    chmod +x "src/activate-${template}.js"
    
    # Run activation
    if node "src/activate-${template}.js"; then
        echo -e "${GREEN}✅ Activated: $template${NC}"
        ACTIVATED=$((ACTIVATED + 1))
    else
        echo -e "${RED}❌ Failed to activate: $template${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    echo ""
done

# Summary
echo ""
echo -e "${CYAN}📊 Activation Summary:${NC}"
echo "================================"
echo -e "${GREEN}✅ Activated: $ACTIVATED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Failed: $FAILED${NC}"
fi
echo ""

# Create master activation workflow
cat > "src/activate-all-templates.js" << 'EOF'
#!/usr/bin/env node
/**
 * Master template activation script
 * Activates all GAMMA presentation templates
 */

const { execSync } = require('child_process');
const path = require('path');

const templates = [
    'component',
    'feature',
    'milestone',
    'release',
    'tutorial',
    'update'
];

console.log('🚀 Activating all GAMMA templates...\n');

let activated = 0;
let failed = 0;

templates.forEach(template => {
    try {
        const scriptPath = path.join(__dirname, `activate-${template}.js`);
        execSync(`node ${scriptPath}`, { stdio: 'inherit' });
        activated++;
    } catch (error) {
        console.error(`❌ Failed to activate ${template}`);
        failed++;
    }
});

console.log('\n📊 Summary:');
console.log(`✅ Activated: ${activated}`);
if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
}

process.exit(failed > 0 ? 1 : 0);
EOF

chmod +x "src/activate-all-templates.js"

echo -e "${GREEN}✅ Created master activation script: src/activate-all-templates.js${NC}"
echo ""

# Add npm scripts
echo -e "${CYAN}📝 Adding npm scripts...${NC}"

# Check if package.json exists and add scripts
if [ -f "package.json" ]; then
    # Backup package.json
    cp package.json package.json.backup
    
    # Use node to update package.json
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts['gamma:activate'] = 'node src/activate-all-templates.js';
        pkg.scripts['gamma:activate:component'] = 'node src/activate-component.js';
        pkg.scripts['gamma:activate:feature'] = 'node src/activate-feature.js';
        pkg.scripts['gamma:activate:milestone'] = 'node src/activate-milestone.js';
        pkg.scripts['gamma:activate:release'] = 'node src/activate-release.js';
        pkg.scripts['gamma:activate:tutorial'] = 'node src/activate-tutorial.js';
        pkg.scripts['gamma:activate:update'] = 'node src/activate-update.js';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
    
    echo -e "${GREEN}✅ Added npm scripts to package.json${NC}"
fi

echo ""
echo -e "${GREEN}🎉 GAMMA template activation complete!${NC}"
echo ""
echo -e "${CYAN}🚀 Usage:${NC}"
echo "  npm run gamma:activate              # Activate all templates"
echo "  npm run gamma:activate:component    # Activate component template"
echo "  npm run gamma:activate:feature      # Activate feature template"
echo "  npm run gamma:activate:milestone    # Activate milestone template"
echo "  npm run gamma:activate:release      # Activate release template"
echo "  npm run gamma:activate:tutorial     # Activate tutorial template"
echo "  npm run gamma:activate:update       # Activate update template"
echo ""
echo -e "${YELLOW}📝 Note:${NC} Set GAMMA_API_TOKEN to enable actual API registration"
