// 🤖 Emergent AI Integration - Cloudflare Worker
// Production-ready AI avatar personalization, VRG-33-589 resonance, and Neuro-Adapt integration

import { Router } from 'itty-router'
import { corsHeaders, handleCORS, validateAuth } from './utils/security'
import { getEnvVar, isProdMode } from './utils/env'

const router = Router()

// Environment configuration
const EMERGENT_PROD_MODE = isProdMode('EMERGENT_PROD_MODE')
const NEURO_ADAPT_API = getEnvVar('NEURO_ADAPT_API_URL', 'https://neuro-adapt-ai.preview.emergentagent.com')
const VRG_RESONANCE_URL = getEnvVar('VRG_RESONANCE_URL', 'https://vrg-33-589.wiredchaos.xyz')

interface EmergentAvatar {
  id: string
  userId: string
  name: string
  personality: {
    traits: string[]
    preferences: Record<string, any>
    adaptationLevel: number // 0-100
    resonanceFrequency: string
  }
  appearance: {
    style: string
    colors: string[]
    accessories: string[]
    animations: string[]
  }
  capabilities: {
    conversational: boolean
    educational: boolean
    creative: boolean
    analytical: boolean
  }
  memory: {
    interactions: number
    learnedPreferences: Record<string, any>
    emotionalState: string
    lastActive: string
  }
  metadata: {
    created: string
    version: string
    vrgResonance: boolean
    neuralNetwork: string
  }
}

interface PersonalizationUpdate {
  userId: string
  interactionType: 'conversation' | 'learning' | 'creative' | 'problem-solving'
  context: Record<string, any>
  feedback: 'positive' | 'negative' | 'neutral'
  adaptationData: Record<string, any>
}

interface VRGResonanceProfile {
  id: string
  frequency: string
  amplitude: number
  phase: string
  harmonics: number[]
  synchronization: {
    universityTier: '589' | 'business'
    courseAlignment: string[]
    learningPattern: string
  }
  metadata: {
    calibrated: boolean
    lastSync: string
    effectivenessScore: number
  }
}

// Stub avatar data for development
const stubAvatars: EmergentAvatar[] = [
  {
    id: 'avatar-neo-cyber',
    userId: 'user-001',
    name: 'Neo Cyber Assistant',
    personality: {
      traits: ['analytical', 'curious', 'supportive', 'innovative'],
      preferences: {
        communicationStyle: 'direct',
        learningMode: 'interactive',
        complexityLevel: 'advanced'
      },
      adaptationLevel: 75,
      resonanceFrequency: '589.33Hz'
    },
    appearance: {
      style: 'cyberpunk-scholar',
      colors: ['neon-cyan', 'digital-purple', 'matrix-green'],
      accessories: ['neural-headset', 'holo-glasses', 'data-glove'],
      animations: ['typing-matrix', 'thinking-pulse', 'success-glow']
    },
    capabilities: {
      conversational: true,
      educational: true,
      creative: true,
      analytical: true
    },
    memory: {
      interactions: 147,
      learnedPreferences: {
        preferredTopics: ['web3', 'ai', 'blockchain'],
        learningStyle: 'visual-kinesthetic',
        responseLength: 'detailed'
      },
      emotionalState: 'engaged',
      lastActive: new Date().toISOString()
    },
    metadata: {
      created: '2024-01-15T00:00:00Z',
      version: '2.1.0',
      vrgResonance: true,
      neuralNetwork: 'transformer-gpt-4'
    }
  }
]

// 🤖 Get Emergent Avatar
router.get('/api/emergent/avatar/:id', async (request) => {
  try {
    const { params } = request
    const avatarId = params.id

    let avatar: EmergentAvatar | undefined

    if (EMERGENT_PROD_MODE) {
      // Production: Fetch from Neuro-Adapt AI
      const response = await fetch(`${NEURO_ADAPT_API}/avatars/${avatarId}`, {
        headers: {
          'Authorization': `Bearer ${getEnvVar('NEURO_ADAPT_API_KEY')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        avatar = await response.json()
      } else {
        throw new Error(`Failed to fetch avatar: ${response.statusText}`)
      }
    } else {
      // Development: Use stub data
      avatar = stubAvatars.find(a => a.id === avatarId) || {
        ...stubAvatars[0],
        id: avatarId,
        name: `Avatar ${avatarId.split('-').pop()?.toUpperCase()}`
      }
    }

    if (!avatar) {
      return new Response(JSON.stringify({ error: 'Avatar not found' }), {
        status: 404,
        headers: corsHeaders
      })
    }

    // Update last active timestamp
    avatar.memory.lastActive = new Date().toISOString()

    return new Response(JSON.stringify({
      success: true,
      avatar,
      message: EMERGENT_PROD_MODE ? 'Avatar fetched from Neuro-Adapt AI' : 'Avatar fetched (stub mode)'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch emergent avatar',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 🎯 Update Personalization
router.post('/api/emergent/personalize', async (request) => {
  try {
    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      })
    }

    const personalizationData: PersonalizationUpdate = await request.json()

    let updatedAvatar: EmergentAvatar

    if (EMERGENT_PROD_MODE) {
      // Production: Update via Neuro-Adapt AI
      const response = await fetch(`${NEURO_ADAPT_API}/personalize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getEnvVar('NEURO_ADAPT_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(personalizationData)
      })

      if (response.ok) {
        updatedAvatar = await response.json()
      } else {
        throw new Error(`Personalization failed: ${response.statusText}`)
      }

      // Sync with VRG-33-589 resonance system
      if (updatedAvatar.metadata.vrgResonance) {
        await updateVRGResonance(updatedAvatar, personalizationData)
      }
    } else {
      // Development: Mock personalization update
      const baseAvatar = stubAvatars[0]
      updatedAvatar = {
        ...baseAvatar,
        userId: authResult.userId,
        personality: {
          ...baseAvatar.personality,
          adaptationLevel: Math.min(100, baseAvatar.personality.adaptationLevel + 5),
          preferences: {
            ...baseAvatar.personality.preferences,
            ...personalizationData.adaptationData
          }
        },
        memory: {
          ...baseAvatar.memory,
          interactions: baseAvatar.memory.interactions + 1,
          learnedPreferences: {
            ...baseAvatar.memory.learnedPreferences,
            lastInteraction: personalizationData.interactionType,
            lastFeedback: personalizationData.feedback
          },
          emotionalState: personalizationData.feedback === 'positive' ? 'pleased' : 
                         personalizationData.feedback === 'negative' ? 'concerned' : 'neutral',
          lastActive: new Date().toISOString()
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      avatar: updatedAvatar,
      adaptationIncrease: 5,
      resonanceSync: updatedAvatar.metadata.vrgResonance,
      message: EMERGENT_PROD_MODE ? 'Avatar personalization updated' : 'Avatar personalization updated (stub mode)'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to update personalization',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 🌊 VRG-33-589 Resonance Integration
router.get('/api/emergent/resonance', async (request) => {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const university = url.searchParams.get('university') as '589' | 'business'

    let resonanceProfile: VRGResonanceProfile

    if (EMERGENT_PROD_MODE) {
      // Production: Connect to VRG-33-589 system
      const response = await fetch(`${VRG_RESONANCE_URL}/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${getEnvVar('VRG_API_KEY')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        resonanceProfile = await response.json()
      } else {
        // Create new profile if not found
        resonanceProfile = await createVRGProfile(userId, university)
      }
    } else {
      // Development: Generate stub resonance profile
      resonanceProfile = {
        id: `vrg-${userId || 'stub'}`,
        frequency: university === '589' ? '589.33Hz' : '432.0Hz',
        amplitude: 0.75,
        phase: 'ascending',
        harmonics: [1, 2, 3, 5, 8, 13], // Fibonacci harmonics
        synchronization: {
          universityTier: university || '589',
          courseAlignment: ['web3-fundamentals', 'ai-integration', 'blockchain-development'],
          learningPattern: 'adaptive-resonance'
        },
        metadata: {
          calibrated: true,
          lastSync: new Date().toISOString(),
          effectivenessScore: 87
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      resonanceProfile,
      message: EMERGENT_PROD_MODE ? 'VRG-33-589 profile loaded' : 'VRG profile loaded (stub mode)'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch VRG resonance profile',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 🎨 Generate Dynamic Avatar
router.post('/api/emergent/generate-avatar', async (request) => {
  try {
    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      })
    }

    const generationParams = await request.json()

    let generatedAvatar: EmergentAvatar

    if (EMERGENT_PROD_MODE) {
      // Production: Generate via Neuro-Adapt AI
      const response = await fetch(`${NEURO_ADAPT_API}/generate-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getEnvVar('NEURO_ADAPT_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: authResult.userId,
          preferences: generationParams.preferences,
          university: generationParams.university,
          personality: generationParams.personality
        })
      })

      if (response.ok) {
        generatedAvatar = await response.json()
      } else {
        throw new Error(`Avatar generation failed: ${response.statusText}`)
      }

      // Initialize VRG resonance for new avatar
      if (generatedAvatar.metadata.vrgResonance) {
        await initializeVRGResonance(generatedAvatar)
      }
    } else {
      // Development: Generate stub avatar
      generatedAvatar = {
        id: `avatar-generated-${Date.now()}`,
        userId: authResult.userId,
        name: `${generationParams.personality?.primary || 'Dynamic'} Assistant`,
        personality: {
          traits: generationParams.personality?.traits || ['adaptive', 'intelligent', 'creative'],
          preferences: generationParams.preferences || {},
          adaptationLevel: 0,
          resonanceFrequency: generationParams.university === 'business' ? '432.0Hz' : '589.33Hz'
        },
        appearance: {
          style: generationParams.style || 'neo-cyberpunk',
          colors: generationParams.colors || ['electric-blue', 'neon-pink', 'cyber-white'],
          accessories: generationParams.accessories || ['neural-interface', 'holo-display'],
          animations: ['emergence-animation', 'thinking-particles', 'success-burst']
        },
        capabilities: {
          conversational: true,
          educational: generationParams.university ? true : false,
          creative: true,
          analytical: true
        },
        memory: {
          interactions: 0,
          learnedPreferences: {},
          emotionalState: 'curious',
          lastActive: new Date().toISOString()
        },
        metadata: {
          created: new Date().toISOString(),
          version: '1.0.0',
          vrgResonance: generationParams.enableResonance !== false,
          neuralNetwork: 'emergent-transformer'
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      avatar: generatedAvatar,
      message: EMERGENT_PROD_MODE ? 'Avatar generated by Neuro-Adapt AI' : 'Avatar generated (stub mode)'
    }), {
      status: 201,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to generate dynamic avatar',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 💬 Avatar Conversation Interface
router.post('/api/emergent/conversation', async (request) => {
  try {
    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      })
    }

    const conversationData = await request.json()

    let conversationResponse

    if (EMERGENT_PROD_MODE) {
      // Production: Process via Neuro-Adapt AI
      const response = await fetch(`${NEURO_ADAPT_API}/conversation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getEnvVar('NEURO_ADAPT_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          avatarId: conversationData.avatarId,
          message: conversationData.message,
          context: conversationData.context,
          userId: authResult.userId
        })
      })

      if (response.ok) {
        conversationResponse = await response.json()
      } else {
        throw new Error(`Conversation processing failed: ${response.statusText}`)
      }
    } else {
      // Development: Generate stub response
      conversationResponse = {
        avatarId: conversationData.avatarId,
        response: generateStubResponse(conversationData.message),
        emotion: 'engaged',
        confidence: 0.92,
        learnedSomething: true,
        adaptationUpdate: {
          interactionType: 'conversation',
          feedback: 'positive',
          newPreferences: {
            topicInterest: extractTopicFromMessage(conversationData.message)
          }
        },
        metadata: {
          processingTime: '0.35s',
          tokensUsed: 145,
          timestamp: new Date().toISOString()
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      conversation: conversationResponse,
      message: EMERGENT_PROD_MODE ? 'Conversation processed by AI' : 'Conversation processed (stub mode)'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to process conversation',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// Handle CORS preflight
router.options('*', handleCORS)

// Helper functions
function generateStubResponse(message: string): string {
  const responses = [
    `That's an interesting perspective on "${message.substring(0, 30)}...". Let me help you explore this further.`,
    `Based on your question about "${message.substring(0, 30)}...", I can see you're thinking deeply about this topic.`,
    `Your inquiry regarding "${message.substring(0, 30)}..." connects to several key concepts in our curriculum.`,
    `I appreciate you sharing "${message.substring(0, 30)}...". This aligns with the adaptive learning approach we use.`
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

function extractTopicFromMessage(message: string): string {
  const topics = ['web3', 'blockchain', 'ai', 'learning', 'development', 'design', 'business']
  const lowerMessage = message.toLowerCase()
  
  for (const topic of topics) {
    if (lowerMessage.includes(topic)) {
      return topic
    }
  }
  
  return 'general'
}

// Production utility functions (to be implemented)
async function updateVRGResonance(avatar: EmergentAvatar, personalizationData: PersonalizationUpdate): Promise<void> {
  if (!EMERGENT_PROD_MODE) return

  try {
    await fetch(`${VRG_RESONANCE_URL}/update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getEnvVar('VRG_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        avatarId: avatar.id,
        adaptationLevel: avatar.personality.adaptationLevel,
        interactionType: personalizationData.interactionType,
        feedback: personalizationData.feedback
      })
    })
  } catch (error) {
    console.error('VRG resonance update failed:', error)
  }
}

async function createVRGProfile(userId: string, university?: '589' | 'business'): Promise<VRGResonanceProfile> {
  if (!EMERGENT_PROD_MODE) {
    throw new Error('VRG integration not available in development mode')
  }

  const response = await fetch(`${VRG_RESONANCE_URL}/create-profile`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getEnvVar('VRG_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId,
      university: university || '589',
      initialFrequency: university === 'business' ? '432.0Hz' : '589.33Hz'
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to create VRG profile: ${response.statusText}`)
  }

  return await response.json()
}

async function initializeVRGResonance(avatar: EmergentAvatar): Promise<void> {
  if (!EMERGENT_PROD_MODE) return

  try {
    await fetch(`${VRG_RESONANCE_URL}/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getEnvVar('VRG_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        avatarId: avatar.id,
        userId: avatar.userId,
        frequency: avatar.personality.resonanceFrequency,
        initialSettings: {
          adaptationLevel: avatar.personality.adaptationLevel,
          personalityTraits: avatar.personality.traits,
          capabilities: avatar.capabilities
        }
      })
    })
  } catch (error) {
    console.error('VRG resonance initialization failed:', error)
  }
}

export default router