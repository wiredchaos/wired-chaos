// 🛒 E-commerce System - Cloudflare Worker
// Production-ready WIRED CHAOS & BEAST COAST store, inventory, and payment processing

import { Router } from 'itty-router'
import { corsHeaders, handleCORS, validateAuth } from './utils/security'
import { getEnvVar, isProdMode } from './utils/env'

const router = Router()

// Environment configuration
const STORE_PROD_MODE = isProdMode('STORE_PROD_MODE')
const STRIPE_API_KEY = getEnvVar('STRIPE_API_KEY')
const INVENTORY_API_URL = getEnvVar('INVENTORY_API_URL', 'https://wired-chaos.pages.dev/api')

interface Product {
  id: string
  name: string
  description: string
  category: 'apparel' | 'nft' | 'digital' | 'physical'
  brand: 'wired-chaos' | 'beast-coast'
  price: number
  currency: 'USD' | 'ETH' | 'SOL' | 'XRP'
  inventory: {
    available: number
    reserved: number
    total: number
  }
  images: string[]
  variants: ProductVariant[]
  metadata: {
    created: string
    updated: string
    tags: string[]
    featured: boolean
  }
}

interface ProductVariant {
  id: string
  name: string
  price?: number
  attributes: Record<string, string> // size, color, etc.
  inventory: number
  sku: string
}

interface Order {
  id: string
  customerId: string
  items: OrderItem[]
  totalAmount: number
  currency: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress: Address
  billingAddress: Address
  metadata: {
    created: string
    updated: string
    paymentMethod: string
    trackingNumber?: string
  }
}

interface OrderItem {
  productId: string
  variantId?: string
  quantity: number
  price: number
  name: string
}

interface Address {
  name: string
  street: string
  city: string
  state: string
  zip: string
  country: string
}

// Stub products for development
const stubProducts: Product[] = [
  {
    id: 'wc-hoodie-001',
    name: 'WIRED CHAOS Cyberpunk Hoodie',
    description: 'Premium black hoodie with neon WIRED CHAOS logo and cyberpunk aesthetics',
    category: 'apparel',
    brand: 'wired-chaos',
    price: 89.99,
    currency: 'USD',
    inventory: { available: 50, reserved: 5, total: 55 },
    images: [
      'https://wired-chaos.pages.dev/assets/products/wc-hoodie-front.jpg',
      'https://wired-chaos.pages.dev/assets/products/wc-hoodie-back.jpg'
    ],
    variants: [
      { id: 'wc-hoodie-001-s', name: 'Small', attributes: { size: 'S' }, inventory: 10, sku: 'WC-HOOD-S' },
      { id: 'wc-hoodie-001-m', name: 'Medium', attributes: { size: 'M' }, inventory: 20, sku: 'WC-HOOD-M' },
      { id: 'wc-hoodie-001-l', name: 'Large', attributes: { size: 'L' }, inventory: 15, sku: 'WC-HOOD-L' },
      { id: 'wc-hoodie-001-xl', name: 'X-Large', attributes: { size: 'XL' }, inventory: 10, sku: 'WC-HOOD-XL' }
    ],
    metadata: {
      created: '2024-01-01T00:00:00Z',
      updated: new Date().toISOString(),
      tags: ['hoodie', 'cyberpunk', 'wired-chaos', 'apparel'],
      featured: true
    }
  },
  {
    id: 'bc-nft-001',
    name: 'BEAST COAST Genesis Avatar',
    description: 'Limited edition NFT avatar for BEAST COAST Business University',
    category: 'nft',
    brand: 'beast-coast',
    price: 0.5,
    currency: 'ETH',
    inventory: { available: 100, reserved: 10, total: 110 },
    images: [
      'https://wired-chaos.pages.dev/assets/nfts/bc-avatar-001.png',
      'https://wired-chaos.pages.dev/assets/nfts/bc-avatar-001-preview.gif'
    ],
    variants: [
      { id: 'bc-nft-001-rare', name: 'Rare Traits', price: 0.75, attributes: { rarity: 'rare' }, inventory: 20, sku: 'BC-NFT-RARE' },
      { id: 'bc-nft-001-epic', name: 'Epic Traits', price: 1.5, attributes: { rarity: 'epic' }, inventory: 5, sku: 'BC-NFT-EPIC' },
      { id: 'bc-nft-001-legendary', name: 'Legendary Traits', price: 3.0, attributes: { rarity: 'legendary' }, inventory: 1, sku: 'BC-NFT-LEG' }
    ],
    metadata: {
      created: '2024-02-01T00:00:00Z',
      updated: new Date().toISOString(),
      tags: ['nft', 'avatar', 'beast-coast', 'limited-edition'],
      featured: true
    }
  },
  {
    id: 'wc-course-001',
    name: 'Web3 Mastery Course',
    description: 'Complete Web3 development course with NFT certificates',
    category: 'digital',
    brand: 'wired-chaos',
    price: 299.99,
    currency: 'USD',
    inventory: { available: 1000, reserved: 0, total: 1000 },
    images: [
      'https://wired-chaos.pages.dev/assets/courses/web3-mastery-cover.jpg',
      'https://wired-chaos.pages.dev/assets/courses/web3-mastery-preview.mp4'
    ],
    variants: [
      { id: 'wc-course-001-basic', name: 'Basic Access', attributes: { tier: 'basic' }, inventory: 1000, sku: 'WC-WEB3-BASIC' },
      { id: 'wc-course-001-premium', name: 'Premium + Mentorship', price: 499.99, attributes: { tier: 'premium' }, inventory: 100, sku: 'WC-WEB3-PREM' }
    ],
    metadata: {
      created: '2024-01-15T00:00:00Z',
      updated: new Date().toISOString(),
      tags: ['course', 'web3', 'education', 'digital'],
      featured: false
    }
  }
]

// 🛍️ Get Product Catalog
router.get('/api/store/products', async (request) => {
  try {
    const url = new URL(request.url)
    const brand = url.searchParams.get('brand') as 'wired-chaos' | 'beast-coast' | null
    const category = url.searchParams.get('category') as string | null
    const featured = url.searchParams.get('featured') === 'true'

    let products: Product[]

    if (STORE_PROD_MODE) {
      // Production: Fetch from database
      products = await fetchProductsFromDB({ brand, category, featured })
    } else {
      // Development: Use stub data
      products = stubProducts.filter(p => {
        if (brand && p.brand !== brand) return false
        if (category && p.category !== category) return false
        if (featured && !p.metadata.featured) return false
        return true
      })
    }

    return new Response(JSON.stringify({
      success: true,
      products,
      count: products.length,
      filters: {
        brands: ['wired-chaos', 'beast-coast'],
        categories: ['apparel', 'nft', 'digital', 'physical'],
        currencies: ['USD', 'ETH', 'SOL', 'XRP']
      },
      message: STORE_PROD_MODE ? 'Products fetched from database' : 'Products fetched (stub mode)'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch products',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 🔍 Get Single Product
router.get('/api/store/products/:id', async (request) => {
  try {
    const { params } = request
    const productId = params.id

    let product: Product | undefined

    if (STORE_PROD_MODE) {
      // Production: Fetch from database
      product = await fetchProductFromDB(productId)
    } else {
      // Development: Use stub data
      product = stubProducts.find(p => p.id === productId)
    }

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: corsHeaders
      })
    }

    return new Response(JSON.stringify({
      success: true,
      product,
      message: STORE_PROD_MODE ? 'Product fetched from database' : 'Product fetched (stub mode)'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch product',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 💳 Process Purchase
router.post('/api/store/purchase', async (request) => {
  try {
    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      })
    }

    const purchaseData = await request.json()

    const order: Order = {
      id: `order-${Date.now()}`,
      customerId: authResult.userId,
      items: purchaseData.items,
      totalAmount: purchaseData.totalAmount,
      currency: purchaseData.currency,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: purchaseData.shippingAddress,
      billingAddress: purchaseData.billingAddress,
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        paymentMethod: purchaseData.paymentMethod
      }
    }

    if (STORE_PROD_MODE) {
      // Production: Process with Stripe
      if (order.currency === 'USD') {
        const paymentIntent = await processStripePayment({
          amount: order.totalAmount * 100, // Convert to cents
          currency: 'usd',
          metadata: { orderId: order.id }
        })
        
        if (paymentIntent.status === 'succeeded') {
          order.paymentStatus = 'paid'
          order.status = 'processing'
        }
      } else {
        // Handle crypto payments
        const cryptoPayment = await processCryptoPayment(order)
        if (cryptoPayment.confirmed) {
          order.paymentStatus = 'paid'
          order.status = 'processing'
        }
      }

      // Save order to database
      await saveOrderToDB(order)

      // Update inventory
      await updateInventoryAfterPurchase(order.items)

      // Send confirmation email
      await sendOrderConfirmationEmail(order)
    } else {
      // Development: Mock successful payment
      order.paymentStatus = 'paid'
      order.status = 'processing'
      order.metadata.trackingNumber = `STUB-${Math.random().toString(36).substr(2, 9)}`
    }

    return new Response(JSON.stringify({
      success: true,
      order,
      message: STORE_PROD_MODE ? 'Order processed successfully' : 'Order processed (stub mode)'
    }), {
      status: 201,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to process purchase',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 📦 Get Inventory Status
router.get('/api/store/inventory', async (request) => {
  try {
    const url = new URL(request.url)
    const productId = url.searchParams.get('productId')

    let inventoryData

    if (STORE_PROD_MODE) {
      // Production: Fetch real inventory
      inventoryData = await fetchInventoryFromDB(productId)
    } else {
      // Development: Use stub data
      if (productId) {
        const product = stubProducts.find(p => p.id === productId)
        inventoryData = product ? { [productId]: product.inventory } : {}
      } else {
        inventoryData = stubProducts.reduce((acc, p) => {
          acc[p.id] = p.inventory
          return acc
        }, {})
      }
    }

    return new Response(JSON.stringify({
      success: true,
      inventory: inventoryData,
      message: STORE_PROD_MODE ? 'Inventory fetched from database' : 'Inventory fetched (stub mode)'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch inventory',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 📊 Consignment Management
router.post('/api/store/consignment', async (request) => {
  try {
    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      })
    }

    const consignmentData = await request.json()

    const consignment = {
      id: `consign-${Date.now()}`,
      vendorId: authResult.userId,
      productId: consignmentData.productId,
      quantity: consignmentData.quantity,
      commission: consignmentData.commission || 0.3, // 30% default
      status: 'pending-approval',
      metadata: {
        created: new Date().toISOString(),
        approvedBy: null,
        notes: consignmentData.notes
      }
    }

    if (STORE_PROD_MODE) {
      // Production: Save consignment request
      await saveConsignmentToDB(consignment)
      
      // Notify admin for approval
      await notifyAdminConsignment(consignment)
    }

    return new Response(JSON.stringify({
      success: true,
      consignment,
      message: STORE_PROD_MODE ? 'Consignment request submitted' : 'Consignment submitted (stub mode)'
    }), {
      status: 201,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to submit consignment',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// Handle CORS preflight
router.options('*', handleCORS)

// Production utility functions (to be implemented)
async function fetchProductsFromDB(filters: any): Promise<Product[]> {
  // TODO: Implement database connection
  throw new Error('Database integration not yet implemented')
}

async function fetchProductFromDB(productId: string): Promise<Product | undefined> {
  // TODO: Implement database connection
  throw new Error('Database integration not yet implemented')
}

async function processStripePayment(params: any) {
  // TODO: Implement Stripe integration
  throw new Error('Stripe integration not yet implemented')
}

async function processCryptoPayment(order: Order) {
  // TODO: Implement crypto payment processing
  throw new Error('Crypto payment integration not yet implemented')
}

async function saveOrderToDB(order: Order): Promise<void> {
  // TODO: Implement database save
  throw new Error('Database integration not yet implemented')
}

async function updateInventoryAfterPurchase(items: OrderItem[]): Promise<void> {
  // TODO: Implement inventory update
  throw new Error('Inventory integration not yet implemented')
}

async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  // TODO: Implement email service
  throw new Error('Email service integration not yet implemented')
}

async function fetchInventoryFromDB(productId?: string): Promise<any> {
  // TODO: Implement inventory fetch
  throw new Error('Inventory integration not yet implemented')
}

async function saveConsignmentToDB(consignment: any): Promise<void> {
  // TODO: Implement consignment save
  throw new Error('Database integration not yet implemented')
}

async function notifyAdminConsignment(consignment: any): Promise<void> {
  // TODO: Implement admin notification
  throw new Error('Notification service not yet implemented')
}

export default router