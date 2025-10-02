// 🎓 WIRED CHAOS - Curriculum Management System
// Two-tiered education: Community College + Business School

/**
 * CurriculumManager - Manages courses, departments, and education programs
 */
export class CurriculumManager {
  constructor(config = {}) {
    this.tiers = {
      community: this.initializeCommunityCollege(),
      business: this.initializeBusinessSchool()
    };
    this.courseCache = new Map();
  }

  /**
   * Initialize Community College (Tier 1 - Free Access)
   */
  initializeCommunityCollege() {
    return {
      tier: 'community',
      name: 'WIRED CHAOS Community College',
      access: 'free',
      description: 'Foundational blockchain and DeFi education for everyone',
      departments: [
        {
          id: 'blockchain-fundamentals',
          name: 'Blockchain Fundamentals',
          focus_areas: [
            'Wallet setup and security',
            'Basic transactions',
            'Understanding gas fees',
            'Blockchain explorers'
          ],
          courses: [
            {
              id: 'bc-101',
              title: 'Blockchain Basics',
              difficulty: 'beginner',
              format: 'video',
              duration: '4 weeks',
              prerequisites: [],
              completion_nft: 'WIRED-CC-BC101',
              topics: [
                'What is blockchain?',
                'Setting up your first wallet',
                'Making your first transaction',
                'Understanding public and private keys'
              ]
            },
            {
              id: 'bc-102',
              title: 'Crypto Security 101',
              difficulty: 'beginner',
              format: 'interactive',
              duration: '2 weeks',
              prerequisites: ['bc-101'],
              completion_nft: 'WIRED-CC-BC102',
              topics: [
                'Security best practices',
                'Avoiding scams and phishing',
                'Hardware wallets',
                'Backup and recovery'
              ]
            }
          ]
        },
        {
          id: 'platform-mastery',
          name: 'Platform Mastery',
          focus_areas: [
            'WIRED CHAOS navigation',
            'Tool usage',
            'Community engagement',
            'Provider onboarding'
          ],
          courses: [
            {
              id: 'pm-101',
              title: 'WIRED CHAOS Platform Guide',
              difficulty: 'beginner',
              format: 'workshop',
              duration: '1 week',
              prerequisites: [],
              completion_nft: 'WIRED-CC-PM101',
              topics: [
                'Platform overview',
                'Navigating the ecosystem',
                'Using integrated tools',
                'Community features'
              ]
            },
            {
              id: 'pm-201',
              title: 'Provider Integration Deep Dive',
              difficulty: 'intermediate',
              format: 'video',
              duration: '3 weeks',
              prerequisites: ['pm-101'],
              completion_nft: 'WIRED-CC-PM201',
              topics: [
                'Alchemy integration',
                'The Graph usage',
                'CoinGecko APIs',
                'Building with providers'
              ]
            }
          ]
        }
      ],
      credential_paths: [
        {
          id: 'blockchain-explorer',
          name: 'Blockchain Explorer Certificate',
          required_courses: ['bc-101', 'bc-102'],
          badge_nft: 'WIRED-CERT-EXPLORER'
        },
        {
          id: 'platform-expert',
          name: 'Platform Expert Certificate',
          required_courses: ['pm-101', 'pm-201'],
          badge_nft: 'WIRED-CERT-PLATFORM'
        }
      ]
    };
  }

  /**
   * Initialize Business School (Tier 2 - Premium Access)
   */
  initializeBusinessSchool() {
    return {
      tier: 'business',
      name: 'WIRED CHAOS Business School',
      access: 'premium',
      description: 'Advanced DeFi strategies and enterprise blockchain solutions',
      departments: [
        {
          id: 'defi-finance',
          name: 'Department of DeFi Finance',
          focus_areas: [
            'Advanced trading strategies',
            'Portfolio management',
            'Yield optimization',
            'Risk management'
          ],
          faculty: [
            {
              name: 'Dr. Yield Optimizer',
              specialization: 'DeFi protocols',
              background: 'Former Aave core team'
            }
          ],
          courses: [
            {
              id: 'df-301',
              title: 'Advanced DeFi Trading',
              difficulty: 'advanced',
              format: 'mentorship',
              duration: '8 weeks',
              prerequisites: ['bc-101', 'bc-102'],
              nft_requirements: ['WIRED-CERT-EXPLORER'],
              completion_nft: 'WIRED-BS-DF301',
              topics: [
                'Arbitrage strategies',
                'Liquidity provision',
                'Impermanent loss mitigation',
                'Advanced order types'
              ]
            },
            {
              id: 'df-401',
              title: 'Institutional DeFi',
              difficulty: 'expert',
              format: 'mentorship',
              duration: '12 weeks',
              prerequisites: ['df-301'],
              completion_nft: 'WIRED-BS-DF401',
              topics: [
                'Enterprise DeFi integration',
                'Regulatory compliance',
                'Treasury management',
                'Risk frameworks'
              ]
            }
          ],
          industry_partnerships: [
            { name: 'Aave', type: 'protocol' },
            { name: 'Compound', type: 'protocol' },
            { name: 'Uniswap', type: 'dex' }
          ]
        },
        {
          id: 'blockchain-tech',
          name: 'Department of Blockchain Technology',
          focus_areas: [
            'Smart contract development',
            'Security auditing',
            'Protocol design',
            'Layer 2 solutions'
          ],
          faculty: [
            {
              name: 'Prof. Smart Contract',
              specialization: 'Solidity development',
              background: 'OpenZeppelin contributor'
            }
          ],
          courses: [
            {
              id: 'bt-301',
              title: 'Smart Contract Development',
              difficulty: 'advanced',
              format: 'workshop',
              duration: '10 weeks',
              prerequisites: ['bc-101'],
              completion_nft: 'WIRED-BS-BT301',
              topics: [
                'Solidity fundamentals',
                'Contract patterns',
                'Testing and debugging',
                'Gas optimization'
              ]
            },
            {
              id: 'bt-401',
              title: 'Security Auditing',
              difficulty: 'expert',
              format: 'workshop',
              duration: '12 weeks',
              prerequisites: ['bt-301'],
              completion_nft: 'WIRED-BS-BT401',
              topics: [
                'Common vulnerabilities',
                'Audit methodologies',
                'Formal verification',
                'Bug bounty programs'
              ]
            }
          ],
          industry_partnerships: [
            { name: 'Consensys', type: 'development' },
            { name: 'OpenZeppelin', type: 'security' },
            { name: 'Chainlink', type: 'oracle' }
          ]
        },
        {
          id: 'business-dev',
          name: 'Department of Business Development',
          focus_areas: [
            'Partnership strategies',
            'Ecosystem building',
            'Tokenomics design',
            'Go-to-market'
          ],
          faculty: [
            {
              name: 'VC Partner Sarah',
              specialization: 'Business strategy',
              background: 'a16z crypto'
            }
          ],
          courses: [
            {
              id: 'bd-301',
              title: 'Web3 Business Strategy',
              difficulty: 'advanced',
              format: 'mentorship',
              duration: '8 weeks',
              prerequisites: [],
              completion_nft: 'WIRED-BS-BD301',
              topics: [
                'Market positioning',
                'Partnership development',
                'Community building',
                'Fundraising strategies'
              ]
            }
          ],
          industry_partnerships: [
            { name: 'Andreessen Horowitz', type: 'vc' },
            { name: 'Coinbase Ventures', type: 'vc' }
          ]
        },
        {
          id: 'analytics-ds',
          name: 'Department of Analytics & Data Science',
          focus_areas: [
            'On-chain analysis',
            'MEV strategies',
            'Market microstructure',
            'Quantitative trading'
          ],
          courses: [
            {
              id: 'ad-301',
              title: 'On-Chain Analytics',
              difficulty: 'advanced',
              format: 'video',
              duration: '6 weeks',
              prerequisites: ['bc-101'],
              completion_nft: 'WIRED-BS-AD301',
              topics: [
                'Data extraction',
                'Analytics frameworks',
                'Visualization techniques',
                'Predictive modeling'
              ]
            }
          ],
          industry_partnerships: [
            { name: 'Dune Analytics', type: 'analytics' },
            { name: 'Nansen', type: 'analytics' },
            { name: 'The Graph', type: 'data' }
          ]
        }
      ],
      credential_paths: [
        {
          id: 'defi-master',
          name: 'DeFi Master Certification',
          required_courses: ['df-301', 'df-401'],
          badge_nft: 'WIRED-MASTER-DEFI'
        },
        {
          id: 'blockchain-engineer',
          name: 'Blockchain Engineer Certification',
          required_courses: ['bt-301', 'bt-401'],
          badge_nft: 'WIRED-MASTER-ENGINEER'
        }
      ]
    };
  }

  /**
   * Get course by ID
   */
  getCourse(courseId, tier = null) {
    // Check cache first
    if (this.courseCache.has(courseId)) {
      return this.courseCache.get(courseId);
    }

    // Search in specified tier or both tiers
    const tiersToSearch = tier ? [tier] : ['community', 'business'];
    
    for (const tierName of tiersToSearch) {
      const tier = this.tiers[tierName];
      for (const dept of tier.departments) {
        const course = dept.courses.find(c => c.id === courseId);
        if (course) {
          const enrichedCourse = {
            ...course,
            tier: tierName,
            department: dept.id,
            department_name: dept.name
          };
          this.courseCache.set(courseId, enrichedCourse);
          return enrichedCourse;
        }
      }
    }

    return null;
  }

  /**
   * Get all courses for a tier
   */
  getCoursesByTier(tier) {
    const tierData = this.tiers[tier];
    if (!tierData) return [];

    const courses = [];
    for (const dept of tierData.departments) {
      for (const course of dept.courses) {
        courses.push({
          ...course,
          tier,
          department: dept.id,
          department_name: dept.name
        });
      }
    }

    return courses;
  }

  /**
   * Check if student meets prerequisites
   */
  checkPrerequisites(courseId, completedCourses = []) {
    const course = this.getCourse(courseId);
    if (!course) {
      return { met: false, missing: [], reason: 'Course not found' };
    }

    const missingPrereqs = course.prerequisites.filter(
      prereq => !completedCourses.includes(prereq)
    );

    const missingNFTs = course.nft_requirements
      ? course.nft_requirements.filter(nft => !completedCourses.includes(nft))
      : [];

    return {
      met: missingPrereqs.length === 0 && missingNFTs.length === 0,
      missing: [...missingPrereqs, ...missingNFTs]
    };
  }

  /**
   * Get learning path for credential
   */
  getLearningPath(credentialId, tier) {
    const tierData = this.tiers[tier];
    if (!tierData) return null;

    const path = tierData.credential_paths.find(p => p.id === credentialId);
    if (!path) return null;

    const courses = path.required_courses.map(courseId => this.getCourse(courseId, tier));

    return {
      ...path,
      tier,
      courses,
      totalDuration: this.calculatePathDuration(courses)
    };
  }

  /**
   * Calculate total duration for a learning path
   */
  calculatePathDuration(courses) {
    return courses.reduce((total, course) => {
      const weeks = parseInt(course.duration) || 0;
      return total + weeks;
    }, 0);
  }

  /**
   * Get department info
   */
  getDepartment(departmentId, tier) {
    const tierData = this.tiers[tier];
    if (!tierData) return null;

    return tierData.departments.find(d => d.id === departmentId);
  }

  /**
   * Search courses
   */
  searchCourses(query, filters = {}) {
    const { tier, difficulty, format, department } = filters;
    let allCourses = [];

    // Collect all courses
    const tiersToSearch = tier ? [tier] : ['community', 'business'];
    tiersToSearch.forEach(t => {
      allCourses = allCourses.concat(this.getCoursesByTier(t));
    });

    // Apply filters
    let filtered = allCourses;

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(lowerQuery) ||
        c.topics.some(t => t.toLowerCase().includes(lowerQuery))
      );
    }

    if (difficulty) {
      filtered = filtered.filter(c => c.difficulty === difficulty);
    }

    if (format) {
      filtered = filtered.filter(c => c.format === format);
    }

    if (department) {
      filtered = filtered.filter(c => c.department === department);
    }

    return filtered;
  }

  /**
   * Get curriculum statistics
   */
  getStatistics() {
    return {
      community: {
        departments: this.tiers.community.departments.length,
        courses: this.getCoursesByTier('community').length,
        credentials: this.tiers.community.credential_paths.length
      },
      business: {
        departments: this.tiers.business.departments.length,
        courses: this.getCoursesByTier('business').length,
        credentials: this.tiers.business.credential_paths.length,
        faculty: this.tiers.business.departments.reduce(
          (sum, d) => sum + (d.faculty?.length || 0), 0
        ),
        partnerships: this.tiers.business.departments.reduce(
          (sum, d) => sum + (d.industry_partnerships?.length || 0), 0
        )
      }
    };
  }
}

export default CurriculumManager;
