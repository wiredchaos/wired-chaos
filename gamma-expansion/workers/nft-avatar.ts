// 🎨 NFT/Avatar System - Cloudflare Worker
// Production-ready avatar minting, customization, and Neuro-Adapt AI integration

import { Router } from 'itty-router'
import { corsHeaders, handleCORS, validateAuth } from './utils/security'
import { getEnvVar, isProdMode } from './utils/env'
import { generateStubAvatar, mintBlockchainNFT } from './utils/nft-utils'

const router = Router()

// Environment configuration
const NEURO_ADAPT_API = getEnvVar('NEURO_ADAPT_API_URL', 'https://neuro-adapt-ai.preview.emergentagent.com')
const NFT_PROD_MODE = isProdMode('NFT_PROD_MODE')

interface AvatarRequest {
  userId: string
  style?: string
  traits?: Record<string, string>
  university?: '589' | 'business'
}

interface AvatarNFT {
  id: string
  tokenId?: string
  name: string
  description: string
  image: string
  traits: Record<string, string>
  university: string
  metadata: {
    created: string
    minted: boolean
    blockchain?: string
    contract?: string
  }
}

// Stub avatar data for development
const generateStubAvatarNFT = (req: AvatarRequest): AvatarNFT => ({
  id: `avatar-${Date.now()}`,
  tokenId: NFT_PROD_MODE ? undefined : `stub-${Math.random().toString(36).substr(2, 9)}`,
  name: `${req.university === '589' ? '589' : 'Business'} University Avatar`,
  description: 'WIRED CHAOS University Student Avatar NFT',
  image: `https://wired-chaos.pages.dev/assets/avatars/${req.style || 'cyberpunk'}_${req.university}.png`,
  traits: {
    style: req.style || 'cyberpunk',
    university: req.university || '589',
    outfit: 'glitch-hoodie',
    accessory: 'neon-visor',
    background: 'matrix-cascade',
    ...req.traits
  },
  university: req.university || '589',
  metadata: {
    created: new Date().toISOString(),
    minted: !NFT_PROD_MODE,
    blockchain: NFT_PROD_MODE ? 'ethereum' : 'stub',
    contract: NFT_PROD_MODE ? getEnvVar('AVATAR_CONTRACT_ADDRESS') : 'stub-contract'
  }
})

// 🎯 Mint Avatar NFT
router.post('/api/avatar/mint', async (request) => {
  try {
    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    const avatarRequest: AvatarRequest = await request.json()

    let avatarNFT: AvatarNFT

    if (NFT_PROD_MODE) {
      // Production: Call Neuro-Adapt AI and mint on blockchain
      const aiAvatar = await fetch(`${NEURO_ADAPT_API}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getEnvVar('NEURO_ADAPT_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          style: avatarRequest.style,
          traits: avatarRequest.traits,
          university: avatarRequest.university
        })
      }).then(res => res.json())

      // Mint NFT on blockchain
      const mintResult = await mintBlockchainNFT({
        to: authResult.userId,
        metadata: aiAvatar.metadata
      })

      avatarNFT = {
        ...generateStubAvatarNFT(avatarRequest),
        id: aiAvatar.id,
        tokenId: mintResult.tokenId,
        image: aiAvatar.imageUrl,
        metadata: {
          ...generateStubAvatarNFT(avatarRequest).metadata,
          minted: true,
          blockchain: mintResult.blockchain,
          contract: mintResult.contractAddress
        }
      }
    } else {
      // Development: Use stub data
      avatarNFT = generateStubAvatarNFT(avatarRequest)
    }

    return new Response(JSON.stringify({
      success: true,
      avatar: avatarNFT,
      message: NFT_PROD_MODE ? 'Avatar minted on blockchain' : 'Avatar created (stub mode)'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to mint avatar', 
      details: error.message 
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 📖 Get Avatar Details
router.get('/api/avatar/:id', async (request) => {
  try {
    const { params } = request
    const avatarId = params.id

    let avatar: AvatarNFT

    if (NFT_PROD_MODE) {
      // Production: Fetch from blockchain
      avatar = await fetchAvatarFromBlockchain(avatarId)
    } else {
      // Development: Return stub data
      avatar = generateStubAvatarNFT({
        userId: 'stub-user',
        style: 'cyberpunk',
        university: '589'
      })
      avatar.id = avatarId
    }

    return new Response(JSON.stringify(avatar), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Avatar not found',
      details: error.message 
    }), {
      status: 404,
      headers: corsHeaders
    })
  }
})

// ✏️ Customize Avatar
router.post('/api/avatar/:id/customize', async (request) => {
  try {
    const { params } = request
    const avatarId = params.id
    const customization = await request.json()

    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    let updatedAvatar: AvatarNFT

    if (NFT_PROD_MODE) {
      // Production: Update avatar via Neuro-Adapt AI
      const updateResult = await fetch(`${NEURO_ADAPT_API}/customize/${avatarId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getEnvVar('NEURO_ADAPT_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customization)
      }).then(res => res.json())

      updatedAvatar = updateResult.avatar
    } else {
      // Development: Mock customization
      updatedAvatar = generateStubAvatarNFT({
        userId: authResult.userId,
        style: customization.style || 'cyberpunk',
        traits: customization.traits || {},
        university: customization.university || '589'
      })
      updatedAvatar.id = avatarId
    }

    return new Response(JSON.stringify({
      success: true,
      avatar: updatedAvatar,
      message: NFT_PROD_MODE ? 'Avatar updated on blockchain' : 'Avatar customized (stub mode)'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to customize avatar', 
      details: error.message 
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 🤖 Generate Avatar via AI
router.get('/api/avatar/generate', async (request) => {
  try {
    const url = new URL(request.url)
    const style = url.searchParams.get('style') || 'cyberpunk'
    const university = url.searchParams.get('university') || '589'

    let generatedAvatar

    if (NFT_PROD_MODE) {
      // Production: Call Neuro-Adapt AI
      generatedAvatar = await fetch(`${NEURO_ADAPT_API}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getEnvVar('NEURO_ADAPT_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ style, university })
      }).then(res => res.json())
    } else {
      // Development: Generate stub avatar
      generatedAvatar = {
        id: `generated-${Date.now()}`,
        style,
        university,
        imageUrl: `https://wired-chaos.pages.dev/assets/avatars/${style}_${university}_generated.png`,
        traits: {
          style,
          university,
          generated: true,
          timestamp: new Date().toISOString()
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      avatar: generatedAvatar,
      message: NFT_PROD_MODE ? 'Avatar generated by Neuro-Adapt AI' : 'Avatar generated (stub mode)'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to generate avatar', 
      details: error.message 
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// Handle CORS preflight
router.options('*', handleCORS)

// Utility functions for production mode
async function fetchAvatarFromBlockchain(avatarId: string): Promise<AvatarNFT> {
  // TODO: Implement blockchain avatar fetching
  const contractAddress = getEnvVar('AVATAR_CONTRACT_ADDRESS')
  // Implementation depends on blockchain provider (Alchemy, Infura, etc.)
  throw new Error('Blockchain integration not yet implemented')
}

async function mintBlockchainNFT(params: { to: string, metadata: any }) {
  // TODO: Implement blockchain minting
  const contractAddress = getEnvVar('AVATAR_CONTRACT_ADDRESS')
  // Implementation depends on blockchain provider and smart contract
  throw new Error('Blockchain minting not yet implemented')
}

export default router