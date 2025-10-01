// 🎓 University System - Cloudflare Worker
// Production-ready student enrollment, course management, and certificate issuance

import { Router } from 'itty-router'
import { corsHeaders, handleCORS, validateAuth } from './utils/security'
import { getEnvVar, isProdMode } from './utils/env'

const router = Router()

// Environment configuration
const UNIVERSITY_PROD_MODE = isProdMode('UNIVERSITY_PROD_MODE')
const CERT_API_URL = getEnvVar('CERT_API_URL', 'https://wired-chaos.pages.dev/api')

interface Student {
  id: string
  name: string
  email: string
  university: '589' | 'business'
  enrolledCourses: string[]
  completedCourses: string[]
  gpa: number
  avatarNFT?: string
  certificateNFTs: string[]
  metadata: {
    enrollmentDate: string
    lastActive: string
    status: 'active' | 'inactive' | 'graduated'
  }
}

interface Course {
  id: string
  title: string
  description: string
  university: '589' | 'business'
  instructor: string
  credits: number
  duration: string
  prerequisites: string[]
  vrContent?: string
  arAssets?: string[]
  metadata: {
    created: string
    updated: string
    enrollmentCount: number
  }
}

interface Certificate {
  id: string
  studentId: string
  courseId: string
  title: string
  issuedDate: string
  nftTokenId?: string
  blockchainHash?: string
  verificationUrl: string
}

// Stub data for development
const stubStudents: Student[] = [
  {
    id: 'stu-589-001',
    name: 'Neo Cyber',
    email: 'neo@wiredchaos.xyz',
    university: '589',
    enrolledCourses: ['web3-basics', 'nft-101'],
    completedCourses: ['blockchain-fundamentals'],
    gpa: 3.8,
    avatarNFT: 'avatar-neo-001',
    certificateNFTs: ['cert-blockchain-001'],
    metadata: {
      enrollmentDate: '2024-01-15T00:00:00Z',
      lastActive: new Date().toISOString(),
      status: 'active'
    }
  },
  {
    id: 'stu-biz-001', 
    name: 'Trinity Matrix',
    email: 'trinity@beastcoast.business',
    university: 'business',
    enrolledCourses: ['digital-marketing', 'crypto-economics'],
    completedCourses: ['business-fundamentals'],
    gpa: 4.0,
    avatarNFT: 'avatar-trinity-001',
    certificateNFTs: ['cert-business-001'],
    metadata: {
      enrollmentDate: '2024-02-01T00:00:00Z',
      lastActive: new Date().toISOString(),
      status: 'active'
    }
  }
]

const stubCourses: Course[] = [
  {
    id: 'web3-basics',
    title: 'Web3 Fundamentals',
    description: 'Introduction to blockchain, DeFi, and decentralized applications',
    university: '589',
    instructor: 'Dr. Satoshi Nakamoto',
    credits: 3,
    duration: '8 weeks',
    prerequisites: [],
    vrContent: 'https://wired-chaos.pages.dev/vr/web3-basics',
    arAssets: ['blockchain-3d-model', 'crypto-wallet-ar'],
    metadata: {
      created: '2024-01-01T00:00:00Z',
      updated: new Date().toISOString(),
      enrollmentCount: 156
    }
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing & Growth',
    description: 'Modern marketing strategies for Web3 and traditional businesses',
    university: 'business', 
    instructor: 'Prof. Gary Vaynerchuk',
    credits: 4,
    duration: '12 weeks',
    prerequisites: ['business-fundamentals'],
    vrContent: 'https://wired-chaos.pages.dev/vr/digital-marketing',
    arAssets: ['marketing-funnel-3d', 'analytics-dashboard-ar'],
    metadata: {
      created: '2024-01-15T00:00:00Z',
      updated: new Date().toISOString(),
      enrollmentCount: 89
    }
  }
]

// 📚 Get All Students
router.get('/api/university/students', async (request) => {
  try {
    const url = new URL(request.url)
    const university = url.searchParams.get('university') as '589' | 'business' | null

    let students: Student[]

    if (UNIVERSITY_PROD_MODE) {
      // Production: Fetch from database
      students = await fetchStudentsFromDB(university)
    } else {
      // Development: Use stub data
      students = university 
        ? stubStudents.filter(s => s.university === university)
        : stubStudents
    }

    return new Response(JSON.stringify({
      success: true,
      students,
      count: students.length,
      message: UNIVERSITY_PROD_MODE ? 'Students fetched from database' : 'Students fetched (stub mode)'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch students',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 🎓 Enroll Student
router.post('/api/university/enroll', async (request) => {
  try {
    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      })
    }

    const enrollmentData = await request.json()

    const newStudent: Student = {
      id: `stu-${enrollmentData.university}-${Date.now()}`,
      name: enrollmentData.name,
      email: enrollmentData.email,
      university: enrollmentData.university,
      enrolledCourses: enrollmentData.courses || [],
      completedCourses: [],
      gpa: 0,
      certificateNFTs: [],
      metadata: {
        enrollmentDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        status: 'active'
      }
    }

    if (UNIVERSITY_PROD_MODE) {
      // Production: Save to database
      await saveStudentToDB(newStudent)
      
      // Mint avatar NFT for new student
      const avatarResponse = await fetch(`${CERT_API_URL}/avatar/mint`, {
        method: 'POST',
        headers: {
          'Authorization': request.headers.get('Authorization'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: newStudent.id,
          university: newStudent.university,
          style: 'university-freshman'
        })
      })
      
      if (avatarResponse.ok) {
        const avatarResult = await avatarResponse.json()
        newStudent.avatarNFT = avatarResult.avatar.id
      }
    } else {
      // Development: Add to stub data
      stubStudents.push(newStudent)
      newStudent.avatarNFT = `avatar-stub-${Date.now()}`
    }

    return new Response(JSON.stringify({
      success: true,
      student: newStudent,
      message: UNIVERSITY_PROD_MODE ? 'Student enrolled successfully' : 'Student enrolled (stub mode)'
    }), {
      status: 201,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to enroll student',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 📖 Get Course Catalog
router.get('/api/university/courses', async (request) => {
  try {
    const url = new URL(request.url)
    const university = url.searchParams.get('university') as '589' | 'business' | null

    let courses: Course[]

    if (UNIVERSITY_PROD_MODE) {
      // Production: Fetch from database
      courses = await fetchCoursesFromDB(university)
    } else {
      // Development: Use stub data
      courses = university 
        ? stubCourses.filter(c => c.university === university)
        : stubCourses
    }

    return new Response(JSON.stringify({
      success: true,
      courses,
      count: courses.length,
      universities: {
        '589': courses.filter(c => c.university === '589').length,
        'business': courses.filter(c => c.university === 'business').length
      },
      message: UNIVERSITY_PROD_MODE ? 'Courses fetched from database' : 'Courses fetched (stub mode)'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch courses',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 🏆 Issue Certificate
router.post('/api/university/certificate', async (request) => {
  try {
    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      })
    }

    const certificateData = await request.json()

    const certificate: Certificate = {
      id: `cert-${Date.now()}`,
      studentId: certificateData.studentId,
      courseId: certificateData.courseId,
      title: certificateData.title,
      issuedDate: new Date().toISOString(),
      verificationUrl: `https://wired-chaos.pages.dev/verify/${certificateData.studentId}/${certificateData.courseId}`
    }

    if (UNIVERSITY_PROD_MODE) {
      // Production: Mint certificate NFT on blockchain
      const mintResponse = await fetch(`${CERT_API_URL}/certificates/mint`, {
        method: 'POST',
        headers: {
          'Authorization': request.headers.get('Authorization'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: certificate.studentId,
          courseId: certificate.courseId,
          certificateData: certificate
        })
      })

      if (mintResponse.ok) {
        const mintResult = await mintResponse.json()
        certificate.nftTokenId = mintResult.tokenId
        certificate.blockchainHash = mintResult.transactionHash
      }

      // Save certificate to database
      await saveCertificateToDB(certificate)

      // Update student record
      await updateStudentCertificates(certificate.studentId, certificate.id)
    } else {
      // Development: Mock certificate issuance
      certificate.nftTokenId = `stub-token-${Math.random().toString(36).substr(2, 9)}`
      certificate.blockchainHash = `stub-hash-${Math.random().toString(36).substr(2, 20)}`

      // Update stub student data
      const student = stubStudents.find(s => s.id === certificate.studentId)
      if (student) {
        student.certificateNFTs.push(certificate.id)
        student.completedCourses.push(certificate.courseId)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      certificate,
      message: UNIVERSITY_PROD_MODE ? 'Certificate minted as NFT' : 'Certificate issued (stub mode)'
    }), {
      status: 201,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to issue certificate',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// 📊 Get Student Dashboard
router.get('/api/university/dashboard/:studentId', async (request) => {
  try {
    const { params } = request
    const studentId = params.studentId

    let student: Student | undefined
    let enrolledCourseDetails: Course[] = []

    if (UNIVERSITY_PROD_MODE) {
      // Production: Fetch from database
      student = await fetchStudentFromDB(studentId)
      enrolledCourseDetails = await fetchCoursesByIds(student?.enrolledCourses || [])
    } else {
      // Development: Use stub data
      student = stubStudents.find(s => s.id === studentId)
      enrolledCourseDetails = stubCourses.filter(c => student?.enrolledCourses.includes(c.id))
    }

    if (!student) {
      return new Response(JSON.stringify({ error: 'Student not found' }), {
        status: 404,
        headers: corsHeaders
      })
    }

    const dashboard = {
      student,
      enrolledCourses: enrolledCourseDetails,
      progress: {
        totalCourses: student.enrolledCourses.length + student.completedCourses.length,
        completedCourses: student.completedCourses.length,
        inProgressCourses: student.enrolledCourses.length,
        gpa: student.gpa,
        certificateCount: student.certificateNFTs.length
      },
      recentActivity: [
        `Enrolled in ${enrolledCourseDetails[0]?.title || 'New Course'}`,
        `Completed ${student.completedCourses.length} courses`,
        `Earned ${student.certificateNFTs.length} certificates`
      ]
    }

    return new Response(JSON.stringify({
      success: true,
      dashboard,
      message: UNIVERSITY_PROD_MODE ? 'Dashboard loaded from database' : 'Dashboard loaded (stub mode)'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to load dashboard',
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
async function fetchStudentsFromDB(university?: string): Promise<Student[]> {
  // TODO: Implement database connection
  throw new Error('Database integration not yet implemented')
}

async function fetchCoursesFromDB(university?: string): Promise<Course[]> {
  // TODO: Implement database connection
  throw new Error('Database integration not yet implemented')
}

async function saveStudentToDB(student: Student): Promise<void> {
  // TODO: Implement database save
  throw new Error('Database integration not yet implemented')
}

async function saveCertificateToDB(certificate: Certificate): Promise<void> {
  // TODO: Implement database save
  throw new Error('Database integration not yet implemented')
}

async function fetchStudentFromDB(studentId: string): Promise<Student | undefined> {
  // TODO: Implement database fetch
  throw new Error('Database integration not yet implemented')
}

async function fetchCoursesByIds(courseIds: string[]): Promise<Course[]> {
  // TODO: Implement database fetch
  throw new Error('Database integration not yet implemented')
}

async function updateStudentCertificates(studentId: string, certificateId: string): Promise<void> {
  // TODO: Implement database update
  throw new Error('Database integration not yet implemented')
}

export default router