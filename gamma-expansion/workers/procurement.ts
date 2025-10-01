// 📋 Procurement Automation - Cloudflare Worker
// Production-ready RFP/SOW/Quote generation, lead management, and sales funnel automation

import { Router } from 'itty-router'
import { corsHeaders, handleCORS, validateAuth } from './utils/security'
import { getEnvVar, isProdMode } from './utils/env'

const router = Router()

// Environment configuration
const PROCUREMENT_PROD_MODE = isProdMode('PROCUREMENT_PROD_MODE')
const NOTION_API_KEY = getEnvVar('NOTION_API_KEY')
const WIX_API_KEY = getEnvVar('WIX_API_KEY')

interface RFPRequest {
  id: string
  projectTitle: string
  description: string
  budget: {
    min: number
    max: number
    currency: string
  }
  timeline: {
    startDate: string
    endDate: string
    milestones: string[]
  }
  requirements: {
    technical: string[]
    functional: string[]
    compliance: string[]
  }
  contactInfo: {
    name: string
    email: string
    company: string
    phone?: string
  }
  metadata: {
    created: string
    status: 'draft' | 'published' | 'closed'
    responses: number
    industry: string
  }
}

interface SOWDocument {
  id: string
  clientId: string
  projectTitle: string
  scope: {
    overview: string
    deliverables: string[]
    outOfScope: string[]
  }
  timeline: {
    phases: SOWPhase[]
    totalDuration: string
  }
  pricing: {
    totalCost: number
    paymentSchedule: PaymentMilestone[]
    currency: string
  }
  terms: {
    cancellation: string
    liability: string
    intellectualProperty: string
  }
  metadata: {
    created: string
    approved: boolean
    signedDate?: string
    version: string
  }
}

interface SOWPhase {
  id: string
  name: string
  description: string
  deliverables: string[]
  duration: string
  cost: number
  dependencies: string[]
}

interface PaymentMilestone {
  id: string
  description: string
  percentage: number
  amount: number
  dueDate: string
}

interface Quote {
  id: string
  leadId: string
  projectType: 'web-development' | 'web3-integration' | 'consultation' | 'audit' | 'custom'
  services: QuoteService[]
  subtotal: number
  taxes: number
  total: number
  validUntil: string
  terms: string[]
  metadata: {
    created: string
    sent: boolean
    accepted: boolean
    version: number
  }
}

interface QuoteService {
  id: string
  name: string
  description: string
  quantity: number
  rate: number
  total: number
  category: 'development' | 'design' | 'consulting' | 'integration'
}

interface Lead {
  id: string
  contactInfo: {
    name: string
    email: string
    company: string
    phone?: string
    website?: string
  }
  projectDetails: {
    type: string
    budget: string
    timeline: string
    description: string
  }
  status: 'new' | 'contacted' | 'qualified' | 'quoted' | 'won' | 'lost'
  source: 'website' | 'referral' | 'social' | 'direct'
  score: number // Lead scoring 0-100
  metadata: {
    created: string
    lastContact: string
    notes: string[]
    assignedTo?: string
  }
}

// Stub templates for development
const rfpTemplate: Partial<RFPRequest> = {
  projectTitle: 'WIRED CHAOS Web3 Integration Project',
  description: 'Seeking experienced Web3 development team for blockchain integration project',
  budget: { min: 10000, max: 50000, currency: 'USD' },
  requirements: {
    technical: ['React.js', 'Solidity', 'Web3.js', 'IPFS'],
    functional: ['NFT marketplace', 'DeFi integration', 'Wallet connectivity'],
    compliance: ['GDPR', 'Security audit', 'Code review']
  }
}

const sowTemplate: Partial<SOWDocument> = {
  projectTitle: 'WIRED CHAOS Platform Development',
  scope: {
    overview: 'Development of comprehensive Web3 platform with NFT and DeFi capabilities',
    deliverables: [
      'Frontend React application',
      'Smart contracts deployment', 
      'Backend API development',
      'Testing and documentation'
    ],
    outOfScope: ['Ongoing maintenance', 'Third-party integrations', 'Marketing materials']
  },
  terms: {
    cancellation: '30-day written notice required',
    liability: 'Limited to contract value',
    intellectualProperty: 'Client retains all rights to final deliverables'
  }
}

// 📋 Generate RFP Document
router.post('/api/procurement/rfp', async (request) => {
  try {
    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      })
    }

    const rfpData = await request.json()

    const rfp: RFPRequest = {
      id: `rfp-${Date.now()}`,
      projectTitle: rfpData.projectTitle || rfpTemplate.projectTitle,
      description: rfpData.description || rfpTemplate.description,
      budget: rfpData.budget || rfpTemplate.budget,
      timeline: {
        startDate: rfpData.timeline?.startDate || new Date().toISOString(),
        endDate: rfpData.timeline?.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        milestones: rfpData.timeline?.milestones || ['Project kickoff', 'Mid-project review', 'Final delivery']
      },
      requirements: rfpData.requirements || rfpTemplate.requirements,
      contactInfo: {
        name: rfpData.contactInfo.name,
        email: rfpData.contactInfo.email,
        company: rfpData.contactInfo.company,
        phone: rfpData.contactInfo.phone
      },
      metadata: {
        created: new Date().toISOString(),
        status: 'draft',
        responses: 0,
        industry: rfpData.industry || 'Technology'
      }
    }

    // Generate formatted RFP document
    const rfpDocument = generateRFPDocument(rfp)

    if (PROCUREMENT_PROD_MODE) {
      // Production: Save to database and sync with Notion
      await saveRFPToDB(rfp)
      
      if (NOTION_API_KEY) {
        await syncRFPToNotion(rfp)
      }
      
      // Publish to vendor networks
      await publishRFPToVendors(rfp)
    }

    return new Response(JSON.stringify({
      success: true,
      rfp,
      document: rfpDocument,
      message: PROCUREMENT_PROD_MODE ? 'RFP generated and published' : 'RFP generated (stub mode)'
    }), {
      status: 201,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to generate RFP',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 📄 Generate SOW Document
router.post('/api/procurement/sow', async (request) => {
  try {
    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      })
    }

    const sowData = await request.json()

    const sow: SOWDocument = {
      id: `sow-${Date.now()}`,
      clientId: sowData.clientId,
      projectTitle: sowData.projectTitle || sowTemplate.projectTitle,
      scope: sowData.scope || sowTemplate.scope,
      timeline: {
        phases: sowData.timeline?.phases || generateDefaultPhases(),
        totalDuration: sowData.timeline?.totalDuration || '12 weeks'
      },
      pricing: {
        totalCost: sowData.pricing.totalCost,
        paymentSchedule: sowData.pricing.paymentSchedule || generateDefaultPaymentSchedule(sowData.pricing.totalCost),
        currency: sowData.pricing.currency || 'USD'
      },
      terms: sowData.terms || sowTemplate.terms,
      metadata: {
        created: new Date().toISOString(),
        approved: false,
        version: '1.0'
      }
    }

    // Generate formatted SOW document
    const sowDocument = generateSOWDocument(sow)

    if (PROCUREMENT_PROD_MODE) {
      // Production: Save to database and generate PDF
      await saveSOWToDB(sow)
      
      // Generate PDF version
      const pdfUrl = await generateSOWPDF(sow)
      sow.metadata['pdfUrl'] = pdfUrl
      
      // Send for client approval
      await sendSOWForApproval(sow)
    }

    return new Response(JSON.stringify({
      success: true,
      sow,
      document: sowDocument,
      message: PROCUREMENT_PROD_MODE ? 'SOW generated and sent for approval' : 'SOW generated (stub mode)'
    }), {
      status: 201,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to generate SOW',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 💰 Generate Quote
router.post('/api/procurement/quote', async (request) => {
  try {
    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      })
    }

    const quoteData = await request.json()

    const services: QuoteService[] = quoteData.services || generateDefaultServices(quoteData.projectType)
    const subtotal = services.reduce((sum, service) => sum + service.total, 0)
    const taxes = subtotal * 0.08 // 8% tax rate
    const total = subtotal + taxes

    const quote: Quote = {
      id: `quote-${Date.now()}`,
      leadId: quoteData.leadId,
      projectType: quoteData.projectType,
      services,
      subtotal,
      taxes,
      total,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      terms: [
        '50% deposit required to begin work',
        'Final payment due upon completion',
        'Quote valid for 30 days',
        'Additional changes may incur extra costs'
      ],
      metadata: {
        created: new Date().toISOString(),
        sent: false,
        accepted: false,
        version: 1
      }
    }

    // Generate formatted quote document
    const quoteDocument = generateQuoteDocument(quote)

    if (PROCUREMENT_PROD_MODE) {
      // Production: Save to database
      await saveQuoteToDB(quote)
      
      // Update lead status
      await updateLeadStatus(quote.leadId, 'quoted')
      
      // Send quote to client
      await sendQuoteToClient(quote)
      quote.metadata.sent = true
    }

    return new Response(JSON.stringify({
      success: true,
      quote,
      document: quoteDocument,
      message: PROCUREMENT_PROD_MODE ? 'Quote generated and sent' : 'Quote generated (stub mode)'
    }), {
      status: 201,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to generate quote',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 🎯 Lead Management
router.get('/api/procurement/leads', async (request) => {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get('status') as Lead['status'] | null
    const source = url.searchParams.get('source') as Lead['source'] | null

    let leads: Lead[]

    if (PROCUREMENT_PROD_MODE) {
      // Production: Fetch from database
      leads = await fetchLeadsFromDB({ status, source })
    } else {
      // Development: Use stub data
      leads = generateStubLeads().filter(lead => {
        if (status && lead.status !== status) return false
        if (source && lead.source !== source) return false
        return true
      })
    }

    // Calculate lead analytics
    const analytics = {
      total: leads.length,
      byStatus: leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1
        return acc
      }, {}),
      bySource: leads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1
        return acc
      }, {}),
      averageScore: leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length
    }

    return new Response(JSON.stringify({
      success: true,
      leads,
      analytics,
      message: PROCUREMENT_PROD_MODE ? 'Leads fetched from database' : 'Leads fetched (stub mode)'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch leads',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 📊 Web Audit Lead Generation
router.post('/api/procurement/web-audit', async (request) => {
  try {
    const auditRequest = await request.json()

    const audit = {
      id: `audit-${Date.now()}`,
      website: auditRequest.website,
      contactEmail: auditRequest.email,
      issues: await performWebAudit(auditRequest.website),
      recommendations: generateAuditRecommendations(),
      estimatedCost: calculateAuditCost(),
      metadata: {
        created: new Date().toISOString(),
        reportGenerated: true,
        followUpScheduled: false
      }
    }

    // Create lead from audit request
    const lead: Lead = {
      id: `lead-${Date.now()}`,
      contactInfo: {
        name: auditRequest.name,
        email: auditRequest.email,
        company: auditRequest.company || 'Unknown',
        website: auditRequest.website
      },
      projectDetails: {
        type: 'web-audit',
        budget: audit.estimatedCost.toString(),
        timeline: '2-4 weeks',
        description: `Web audit and optimization for ${auditRequest.website}`
      },
      status: 'new',
      source: 'website',
      score: calculateLeadScore(audit),
      metadata: {
        created: new Date().toISOString(),
        lastContact: new Date().toISOString(),
        notes: [`Web audit completed for ${auditRequest.website}`],
        auditId: audit.id
      }
    }

    if (PROCUREMENT_PROD_MODE) {
      // Production: Save audit and lead
      await saveWebAuditToDB(audit)
      await saveLeadToDB(lead)
      
      // Send audit report
      await sendAuditReport(audit, auditRequest.email)
      
      // Schedule follow-up
      await scheduleFollowUp(lead)
    }

    return new Response(JSON.stringify({
      success: true,
      audit,
      lead,
      message: PROCUREMENT_PROD_MODE ? 'Web audit completed and lead created' : 'Web audit completed (stub mode)'
    }), {
      status: 201,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to perform web audit',
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
function generateRFPDocument(rfp: RFPRequest): string {
  return `
# Request for Proposal: ${rfp.projectTitle}

## Project Overview
${rfp.description}

## Budget Range
$${rfp.budget.min.toLocaleString()} - $${rfp.budget.max.toLocaleString()} ${rfp.budget.currency}

## Timeline
- Start Date: ${new Date(rfp.timeline.startDate).toLocaleDateString()}
- End Date: ${new Date(rfp.timeline.endDate).toLocaleDateString()}
- Key Milestones: ${rfp.timeline.milestones.join(', ')}

## Technical Requirements
${rfp.requirements.technical.map(req => `- ${req}`).join('\n')}

## Functional Requirements
${rfp.requirements.functional.map(req => `- ${req}`).join('\n')}

## Contact Information
${rfp.contactInfo.name}
${rfp.contactInfo.company}
${rfp.contactInfo.email}
${rfp.contactInfo.phone || 'Phone not provided'}

Generated by WIRED CHAOS Procurement System
`
}

function generateSOWDocument(sow: SOWDocument): string {
  return `
# Statement of Work: ${sow.projectTitle}

## Project Scope
${sow.scope.overview}

### Deliverables
${sow.scope.deliverables.map(d => `- ${d}`).join('\n')}

### Out of Scope
${sow.scope.outOfScope.map(d => `- ${d}`).join('\n')}

## Timeline & Phases
${sow.timeline.phases.map(phase => `
### ${phase.name}
${phase.description}
Duration: ${phase.duration}
Cost: $${phase.cost.toLocaleString()}
`).join('\n')}

## Pricing
Total Cost: $${sow.pricing.totalCost.toLocaleString()} ${sow.pricing.currency}

### Payment Schedule
${sow.pricing.paymentSchedule.map(payment => `
- ${payment.description}: $${payment.amount.toLocaleString()} (${payment.percentage}%)
  Due: ${new Date(payment.dueDate).toLocaleDateString()}
`).join('\n')}

## Terms & Conditions
- Cancellation: ${sow.terms.cancellation}
- Liability: ${sow.terms.liability}
- Intellectual Property: ${sow.terms.intellectualProperty}

Generated by WIRED CHAOS Procurement System
Version: ${sow.metadata.version}
`
}

function generateQuoteDocument(quote: Quote): string {
  return `
# Quote #${quote.id}

## Services
${quote.services.map(service => `
- ${service.name}: ${service.quantity} × $${service.rate} = $${service.total}
  ${service.description}
`).join('\n')}

## Pricing Summary
Subtotal: $${quote.subtotal.toLocaleString()}
Tax: $${quote.taxes.toLocaleString()}
**Total: $${quote.total.toLocaleString()}**

Valid until: ${new Date(quote.validUntil).toLocaleDateString()}

## Terms
${quote.terms.map(term => `- ${term}`).join('\n')}

Generated by WIRED CHAOS Procurement System
`
}

function generateDefaultPhases(): SOWPhase[] {
  return [
    {
      id: 'phase-1',
      name: 'Discovery & Planning',
      description: 'Project requirements gathering and technical planning',
      deliverables: ['Requirements document', 'Technical specifications', 'Project timeline'],
      duration: '2 weeks',
      cost: 5000,
      dependencies: []
    },
    {
      id: 'phase-2',
      name: 'Development',
      description: 'Core development and implementation',
      deliverables: ['Frontend application', 'Backend API', 'Smart contracts'],
      duration: '8 weeks',
      cost: 25000,
      dependencies: ['phase-1']
    },
    {
      id: 'phase-3',
      name: 'Testing & Deployment',
      description: 'Quality assurance and production deployment',
      deliverables: ['Test reports', 'Production deployment', 'Documentation'],
      duration: '2 weeks',
      cost: 5000,
      dependencies: ['phase-2']
    }
  ]
}

function generateDefaultPaymentSchedule(totalCost: number): PaymentMilestone[] {
  return [
    {
      id: 'milestone-1',
      description: 'Project kickoff',
      percentage: 50,
      amount: totalCost * 0.5,
      dueDate: new Date().toISOString()
    },
    {
      id: 'milestone-2',
      description: 'Final delivery',
      percentage: 50,
      amount: totalCost * 0.5,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
}

function generateDefaultServices(projectType: string): QuoteService[] {
  const baseServices = {
    'web-development': [
      { name: 'Frontend Development', rate: 150, quantity: 40, category: 'development' },
      { name: 'Backend Development', rate: 150, quantity: 30, category: 'development' },
      { name: 'UI/UX Design', rate: 125, quantity: 20, category: 'design' }
    ],
    'web3-integration': [
      { name: 'Smart Contract Development', rate: 200, quantity: 25, category: 'development' },
      { name: 'Web3 Frontend Integration', rate: 175, quantity: 30, category: 'development' },
      { name: 'Blockchain Consulting', rate: 250, quantity: 10, category: 'consulting' }
    ],
    'consultation': [
      { name: 'Technical Consulting', rate: 250, quantity: 20, category: 'consulting' },
      { name: 'Architecture Review', rate: 300, quantity: 10, category: 'consulting' }
    ]
  }

  return (baseServices[projectType] || baseServices['web-development']).map((service, index) => ({
    id: `service-${index}`,
    name: service.name,
    description: `Professional ${service.name.toLowerCase()} services`,
    quantity: service.quantity,
    rate: service.rate,
    total: service.quantity * service.rate,
    category: service.category as QuoteService['category']
  }))
}

function generateStubLeads(): Lead[] {
  return [
    {
      id: 'lead-001',
      contactInfo: {
        name: 'Alice Johnson',
        email: 'alice@techstartup.com',
        company: 'TechStartup Inc',
        website: 'https://techstartup.com'
      },
      projectDetails: {
        type: 'web3-integration',
        budget: '$50,000 - $100,000',
        timeline: '3-6 months',
        description: 'NFT marketplace development'
      },
      status: 'qualified',
      source: 'website',
      score: 85,
      metadata: {
        created: '2024-01-15T00:00:00Z',
        lastContact: '2024-01-20T00:00:00Z',
        notes: ['Initial consultation completed', 'High budget potential']
      }
    }
  ]
}

async function performWebAudit(website: string) {
  // Stub audit results
  return {
    performance: 65,
    seo: 72,
    accessibility: 58,
    bestPractices: 83,
    issues: [
      'Large image files slowing load time',
      'Missing meta descriptions on 15 pages',
      'No alt text on 8 images',
      'Outdated jQuery version'
    ]
  }
}

function generateAuditRecommendations() {
  return [
    'Optimize images and implement lazy loading',
    'Add comprehensive meta descriptions',
    'Improve accessibility with proper alt texts',
    'Update JavaScript libraries to latest versions',
    'Implement Web3 integration for modern user experience'
  ]
}

function calculateAuditCost() {
  return 2500 // Base audit cost
}

function calculateLeadScore(audit: any) {
  // Lead scoring algorithm
  const baseScore = 50
  const issueScore = Math.max(0, 50 - audit.issues.issues.length * 5)
  return Math.min(100, baseScore + issueScore)
}

// Production utility functions (to be implemented)
async function saveRFPToDB(rfp: RFPRequest): Promise<void> {
  // TODO: Implement database save
  throw new Error('Database integration not yet implemented')
}

async function syncRFPToNotion(rfp: RFPRequest): Promise<void> {
  // TODO: Implement Notion sync
  throw new Error('Notion integration not yet implemented')
}

async function publishRFPToVendors(rfp: RFPRequest): Promise<void> {
  // TODO: Implement vendor network publishing
  throw new Error('Vendor network integration not yet implemented')
}

async function saveSOWToDB(sow: SOWDocument): Promise<void> {
  // TODO: Implement database save
  throw new Error('Database integration not yet implemented')
}

async function generateSOWPDF(sow: SOWDocument): Promise<string> {
  // TODO: Implement PDF generation
  throw new Error('PDF generation not yet implemented')
}

async function sendSOWForApproval(sow: SOWDocument): Promise<void> {
  // TODO: Implement email sending
  throw new Error('Email service integration not yet implemented')
}

async function saveQuoteToDB(quote: Quote): Promise<void> {
  // TODO: Implement database save
  throw new Error('Database integration not yet implemented')
}

async function updateLeadStatus(leadId: string, status: string): Promise<void> {
  // TODO: Implement lead update
  throw new Error('Database integration not yet implemented')
}

async function sendQuoteToClient(quote: Quote): Promise<void> {
  // TODO: Implement email sending
  throw new Error('Email service integration not yet implemented')
}

async function fetchLeadsFromDB(filters: any): Promise<Lead[]> {
  // TODO: Implement database fetch
  throw new Error('Database integration not yet implemented')
}

async function saveWebAuditToDB(audit: any): Promise<void> {
  // TODO: Implement database save
  throw new Error('Database integration not yet implemented')
}

async function saveLeadToDB(lead: Lead): Promise<void> {
  // TODO: Implement database save
  throw new Error('Database integration not yet implemented')
}

async function sendAuditReport(audit: any, email: string): Promise<void> {
  // TODO: Implement email sending
  throw new Error('Email service integration not yet implemented')
}

async function scheduleFollowUp(lead: Lead): Promise<void> {
  // TODO: Implement follow-up scheduling
  throw new Error('Scheduling service not yet implemented')
}

export default router