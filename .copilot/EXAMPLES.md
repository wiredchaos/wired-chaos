# Copilot Usage Examples

This document provides practical examples of how to use the WIRED CHAOS Copilot configuration system.

## 🚀 Getting Started

Once you have the configuration files in place, Copilot will automatically have access to all project context. You don't need to explain the architecture in every prompt.

## 💡 Example Prompts

### Creating a New API Endpoint

**Prompt:**
```
Create a new Cloudflare Worker endpoint at /api/nft/mint that:
- Requires Bearer token authentication
- Accepts POST requests with chain and metadata
- Returns proper Response objects with CORS headers
- Includes error handling
```

**What Copilot Knows:**
- Worker structure from `context.md`
- Bearer token patterns from `security-patterns.md`
- CORS configuration from `autofix-patterns.md`
- Response formatting standards

### Fixing JSX Errors

**Prompt:**
```
Fix JSX nesting errors in this component
```

**What Copilot Knows:**
- Common JSX nesting violations from `autofix-patterns.md`
- Valid parent-child relationships
- Semantic HTML alternatives

### Adding AR/VR Support

**Prompt:**
```
Add model-viewer component for this 3D product with AR support
```

**What Copilot Knows:**
- Model viewer integration from `ar-vr-config.md`
- Required MIME types and headers
- XR session handling
- Error handling patterns

### Creating Health Checks

**Prompt:**
```
Create a health check endpoint following our standards
```

**What Copilot Knows:**
- Health check patterns from `infrastructure.md`
- KV and R2 connectivity checks
- Response format standards

### Implementing Security

**Prompt:**
```
Add wallet verification for this endpoint supporting Ethereum and Solana
```

**What Copilot Knows:**
- Wallet gating patterns from `security-patterns.md`
- Multi-chain verification
- Signature validation

## 🎨 Design System Usage

### Creating Styled Components

**Prompt:**
```
Create a neon button component using our brand colors
```

**What Copilot Knows:**
- Color palette from `color-palette.md`
- Neon glow effects
- Tailwind configuration
- Hover states

**Copilot Will Generate:**
```jsx
function NeonButton({ children, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="
        px-6 py-3
        bg-transparent
        text-cyan-neon
        border-2 border-cyan-neon
        hover:bg-cyan-neon hover:text-black-base
        shadow-glow-cyan
        transition-all duration-300
        uppercase tracking-wider
        font-bold
      "
    >
      {children}
    </button>
  );
}
```

### Creating Alert Components

**Prompt:**
```
Create success, error, and warning alert components
```

**What Copilot Knows:**
- Color meanings (green=success, red=error)
- Standard alert patterns
- Consistent styling

## 🔧 Common Tasks

### 1. Environment Variable Handling

**Prompt:**
```
Fix environment variable access to work in Workers, Node.js, and browser
```

**Before:**
```javascript
const apiKey = process.env.API_KEY;
```

**After (Copilot generates):**
```javascript
const apiKey = env?.API_KEY || process?.env?.API_KEY || '';
```

### 2. Adding CORS to Worker

**Prompt:**
```
Add CORS headers to this worker endpoint
```

**Copilot generates:**
```javascript
export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    const response = await handleRequest(request, env);
    
    // Add CORS headers to response
    response.headers.set('Access-Control-Allow-Origin', '*');
    
    return response;
  }
};
```

### 3. Implementing Circuit Breaker

**Prompt:**
```
Wrap this API call in a circuit breaker
```

**Copilot generates complete circuit breaker pattern** based on `security-patterns.md`.

### 4. Creating KV Cache Pattern

**Prompt:**
```
Implement cache-first pattern for this data fetch
```

**Copilot generates:**
```javascript
async function getData(key, env) {
  // Try cache first
  const cached = await env.CACHE.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from origin
  const data = await fetchFromOrigin();
  
  // Store in cache
  await env.CACHE.put(key, JSON.stringify(data), {
    expirationTtl: 3600
  });
  
  return data;
}
```

## 🐛 Auto-Fix Examples

### JSX Nesting Fix

**You write:**
```jsx
<p>
  <div>Invalid nesting</div>
</p>
```

**Copilot suggests:**
```jsx
<div>
  <p>Valid nesting</p>
</div>
```

### Environment Variable Fix

**You write:**
```javascript
const token = process.env.API_TOKEN;
```

**Copilot suggests:**
```javascript
const token = env?.API_TOKEN || process?.env?.API_TOKEN || '';
```

### CORS Fix

**You write:**
```javascript
return new Response(data);
```

**Copilot suggests:**
```javascript
return new Response(data, {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
});
```

## 📚 Advanced Usage

### Creating Complete Features

**Prompt:**
```
Create a complete NFT minting flow with:
- React component with form
- Worker endpoint with authentication
- Blockchain integration
- Error handling
- Success feedback
```

**What Copilot Will Do:**
1. Generate React component using brand colors
2. Create Worker endpoint with Bearer auth
3. Add proper error handling
4. Include CORS headers
5. Use correct Response formats
6. Follow all coding standards

### Refactoring Code

**Prompt:**
```
Refactor this code to follow WIRED CHAOS standards
```

**What Copilot Checks:**
- Environment variable access
- Error handling
- Response formatting
- Security patterns
- Code style

### Generating Tests

**Prompt:**
```
Create tests for this component/endpoint
```

**What Copilot Includes:**
- Proper test structure
- Edge cases
- Error scenarios
- Mocking patterns

## 🎯 Best Practices

### Be Specific

✅ Good:
```
Create a Cloudflare Worker endpoint with Bearer authentication
```

❌ Too vague:
```
Create an API endpoint
```

### Reference Standards

✅ Good:
```
Add health checks following our infrastructure standards
```

❌ Missing context:
```
Add health checks
```

### Use Project Terminology

✅ Good:
```
Implement Vault33 point system for this action
```

❌ Generic:
```
Add points to user
```

## 🔍 Debugging with Copilot

### Finding Errors

**Prompt:**
```
Why is this component not rendering correctly?
```

**Copilot checks:**
- JSX nesting
- Missing imports
- Props usage
- State management

### Performance Issues

**Prompt:**
```
How can I optimize this component?
```

**Copilot suggests:**
- Memoization
- Code splitting
- Lazy loading
- Caching strategies

## 📝 Documentation Generation

**Prompt:**
```
Add JSDoc comments to this function following our standards
```

**Copilot generates:**
```javascript
/**
 * Mints an NFT certificate on the specified blockchain
 * 
 * @param {string} chain - Blockchain network (ethereum, solana, xrpl)
 * @param {Object} metadata - NFT metadata
 * @param {string} metadata.name - Certificate name
 * @param {string} metadata.description - Certificate description
 * @param {string} recipient - Recipient wallet address
 * @returns {Promise<Object>} Minting result with tokenId and transaction hash
 * @throws {Error} If minting fails or invalid parameters
 */
async function mintNFTCertificate(chain, metadata, recipient) {
  // Implementation
}
```

## 🚨 Error Messages

Copilot understands our error message patterns:

**Prompt:**
```
Create an error response for invalid token
```

**Copilot generates:**
```javascript
return new Response(
  JSON.stringify({ 
    error: 'Invalid authentication token',
    code: 'AUTH_INVALID_TOKEN',
    timestamp: Date.now()
  }),
  {
    status: 403,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  }
);
```

## 💡 Tips for Maximum Effectiveness

1. **Trust the Context**: Copilot already knows the architecture
2. **Be Specific**: Mention specific patterns or standards when needed
3. **Iterate**: Let Copilot refine suggestions based on feedback
4. **Verify**: Always review generated code for correctness
5. **Learn**: Study Copilot's suggestions to understand patterns better

## 🆘 When Copilot Needs Help

If Copilot doesn't seem to know something:

1. Check if it's documented in `.copilot/*.md` files
2. Add the pattern if missing
3. Reload VS Code window
4. Try being more specific in your prompt

## 📖 Further Reading

- `.copilot/context.md` - Full project context
- `.copilot/autofix-patterns.md` - Common fixes
- `.copilot/security-patterns.md` - Security implementations
- `.copilot/infrastructure.md` - Infrastructure patterns

---

**Remember**: The configuration system makes Copilot an expert in WIRED CHAOS. Use it to accelerate development while maintaining high code quality!
