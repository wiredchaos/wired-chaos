// 📊 WIRED CHAOS - Student Progress Tracking System
// Achievement tracking and NFT certificate issuance

/**
 * ProgressTracker - Manages student progress and NFT certificates
 */
export class ProgressTracker {
  constructor(config = {}) {
    this.nftMinter = config.nftMinter || null;
    this.storage = config.storage || new Map();
    this.achievements = this.initializeAchievements();
  }

  /**
   * Initialize achievement system
   */
  initializeAchievements() {
    return {
      milestones: [
        {
          id: 'first-course',
          name: 'First Steps',
          description: 'Complete your first course',
          nft: 'WIRED-ACH-FIRST',
          condition: { type: 'courses_completed', value: 1 }
        },
        {
          id: 'community-grad',
          name: 'Community Graduate',
          description: 'Complete all Community College courses',
          nft: 'WIRED-ACH-CC-GRAD',
          condition: { type: 'tier_completion', tier: 'community' }
        },
        {
          id: 'business-elite',
          name: 'Business School Elite',
          description: 'Complete Business School program',
          nft: 'WIRED-ACH-BS-GRAD',
          condition: { type: 'tier_completion', tier: 'business' }
        },
        {
          id: 'streak-master',
          name: 'Consistency King',
          description: 'Study for 30 days straight',
          nft: 'WIRED-ACH-STREAK',
          condition: { type: 'streak_days', value: 30 }
        }
      ],
      badges: [
        {
          id: 'early-adopter',
          name: 'Early Adopter',
          description: 'One of the first 1000 students',
          nft: 'WIRED-BADGE-EARLY'
        },
        {
          id: 'community-leader',
          name: 'Community Leader',
          description: 'Help 10+ students in forums',
          nft: 'WIRED-BADGE-LEADER'
        }
      ]
    };
  }

  /**
   * Initialize student progress
   */
  initializeStudent(studentId, walletAddress) {
    const studentData = {
      id: studentId,
      wallet: walletAddress,
      enrolledAt: new Date().toISOString(),
      tier: 'community',
      courses: {
        enrolled: [],
        in_progress: [],
        completed: []
      },
      nfts: {
        certificates: [],
        achievements: [],
        badges: []
      },
      stats: {
        coursesCompleted: 0,
        totalStudyTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActive: new Date().toISOString()
      },
      progress: {}
    };

    this.storage.set(studentId, studentData);
    return studentData;
  }

  /**
   * Get student progress
   */
  getStudentProgress(studentId) {
    return this.storage.get(studentId) || null;
  }

  /**
   * Enroll student in course
   */
  enrollInCourse(studentId, courseId, courseTier) {
    const student = this.getStudentProgress(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Check if already enrolled
    if (student.courses.enrolled.includes(courseId)) {
      return { success: false, reason: 'Already enrolled' };
    }

    // Check tier access
    if (courseTier === 'business' && student.tier === 'community') {
      return { success: false, reason: 'Upgrade to Business School required' };
    }

    student.courses.enrolled.push(courseId);
    student.courses.in_progress.push(courseId);
    student.progress[courseId] = {
      enrolledAt: new Date().toISOString(),
      progress: 0,
      lessonsCompleted: [],
      lastAccessed: new Date().toISOString()
    };

    this.storage.set(studentId, student);
    return { success: true, courseId };
  }

  /**
   * Update course progress
   */
  updateCourseProgress(studentId, courseId, lessonId, progressPercent) {
    const student = this.getStudentProgress(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const courseProgress = student.progress[courseId];
    if (!courseProgress) {
      throw new Error('Not enrolled in this course');
    }

    // Update lesson completion
    if (!courseProgress.lessonsCompleted.includes(lessonId)) {
      courseProgress.lessonsCompleted.push(lessonId);
    }

    // Update overall progress
    courseProgress.progress = Math.min(100, progressPercent);
    courseProgress.lastAccessed = new Date().toISOString();
    student.stats.lastActive = new Date().toISOString();

    this.storage.set(studentId, student);
    return { success: true, progress: courseProgress.progress };
  }

  /**
   * Complete course and issue NFT certificate
   */
  async completeCourse(studentId, courseId, courseData) {
    const student = this.getStudentProgress(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const courseProgress = student.progress[courseId];
    if (!courseProgress) {
      throw new Error('Not enrolled in this course');
    }

    // Mark course as completed
    courseProgress.completedAt = new Date().toISOString();
    courseProgress.progress = 100;

    // Update student records
    const inProgressIndex = student.courses.in_progress.indexOf(courseId);
    if (inProgressIndex > -1) {
      student.courses.in_progress.splice(inProgressIndex, 1);
    }
    student.courses.completed.push(courseId);
    student.stats.coursesCompleted++;

    // Issue NFT certificate
    const nftResult = await this.issueNFTCertificate(
      studentId,
      student.wallet,
      courseData.completion_nft,
      {
        courseId,
        courseName: courseData.title,
        completedAt: courseProgress.completedAt,
        tier: courseData.tier
      }
    );

    if (nftResult.success) {
      student.nfts.certificates.push({
        nft: courseData.completion_nft,
        courseId,
        issuedAt: courseProgress.completedAt,
        txHash: nftResult.txHash,
        tokenId: nftResult.tokenId
      });
    }

    // Check for achievements
    await this.checkAchievements(studentId);

    this.storage.set(studentId, student);

    return {
      success: true,
      courseId,
      nft: nftResult
    };
  }

  /**
   * Issue NFT certificate
   */
  async issueNFTCertificate(studentId, walletAddress, nftId, metadata) {
    // Mock implementation - in production, this would interact with blockchain
    const blockchains = ['ethereum', 'solana', 'xrpl', 'hedera', 'dogecoin'];
    const selectedChain = blockchains[Math.floor(Math.random() * blockchains.length)];

    return {
      success: true,
      nftId,
      blockchain: selectedChain,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      tokenId: Math.floor(Math.random() * 100000),
      explorerUrl: `https://${selectedChain}.explorer.com/tx/0x${Math.random().toString(16).substr(2, 64)}`,
      metadata: {
        ...metadata,
        studentId,
        walletAddress
      }
    };
  }

  /**
   * Check and award achievements
   */
  async checkAchievements(studentId) {
    const student = this.getStudentProgress(studentId);
    if (!student) return;

    const newAchievements = [];

    for (const milestone of this.achievements.milestones) {
      // Check if already earned
      if (student.nfts.achievements.some(a => a.nft === milestone.nft)) {
        continue;
      }

      // Check condition
      let earned = false;
      switch (milestone.condition.type) {
        case 'courses_completed':
          earned = student.stats.coursesCompleted >= milestone.condition.value;
          break;
        case 'tier_completion':
          // Would check if all tier courses are completed
          earned = false; // Simplified for now
          break;
        case 'streak_days':
          earned = student.stats.currentStreak >= milestone.condition.value;
          break;
      }

      if (earned) {
        const nftResult = await this.issueNFTCertificate(
          studentId,
          student.wallet,
          milestone.nft,
          {
            achievementId: milestone.id,
            achievementName: milestone.name,
            earnedAt: new Date().toISOString()
          }
        );

        if (nftResult.success) {
          student.nfts.achievements.push({
            nft: milestone.nft,
            achievementId: milestone.id,
            issuedAt: new Date().toISOString(),
            txHash: nftResult.txHash,
            tokenId: nftResult.tokenId
          });
          newAchievements.push(milestone);
        }
      }
    }

    if (newAchievements.length > 0) {
      this.storage.set(studentId, student);
    }

    return newAchievements;
  }

  /**
   * Award badge
   */
  async awardBadge(studentId, badgeId) {
    const student = this.getStudentProgress(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const badge = this.achievements.badges.find(b => b.id === badgeId);
    if (!badge) {
      throw new Error('Badge not found');
    }

    // Check if already has badge
    if (student.nfts.badges.some(b => b.nft === badge.nft)) {
      return { success: false, reason: 'Badge already earned' };
    }

    const nftResult = await this.issueNFTCertificate(
      studentId,
      student.wallet,
      badge.nft,
      {
        badgeId: badge.id,
        badgeName: badge.name,
        earnedAt: new Date().toISOString()
      }
    );

    if (nftResult.success) {
      student.nfts.badges.push({
        nft: badge.nft,
        badgeId: badge.id,
        issuedAt: new Date().toISOString(),
        txHash: nftResult.txHash,
        tokenId: nftResult.tokenId
      });
      this.storage.set(studentId, student);
    }

    return { success: true, badge, nft: nftResult };
  }

  /**
   * Upgrade student to Business School tier
   */
  upgradeToBusiness(studentId) {
    const student = this.getStudentProgress(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    if (student.tier === 'business') {
      return { success: false, reason: 'Already in Business School' };
    }

    student.tier = 'business';
    student.upgradedAt = new Date().toISOString();
    this.storage.set(studentId, student);

    return { success: true, tier: 'business' };
  }

  /**
   * Get student dashboard data
   */
  getDashboard(studentId) {
    const student = this.getStudentProgress(studentId);
    if (!student) {
      return null;
    }

    const coursesInProgress = student.courses.in_progress.map(courseId => ({
      courseId,
      progress: student.progress[courseId]?.progress || 0,
      lastAccessed: student.progress[courseId]?.lastAccessed
    }));

    return {
      student: {
        id: student.id,
        tier: student.tier,
        enrolledAt: student.enrolledAt
      },
      progress: {
        coursesCompleted: student.stats.coursesCompleted,
        coursesInProgress: coursesInProgress.length,
        totalNFTs: student.nfts.certificates.length +
                   student.nfts.achievements.length +
                   student.nfts.badges.length
      },
      currentCourses: coursesInProgress,
      recentNFTs: [
        ...student.nfts.certificates,
        ...student.nfts.achievements,
        ...student.nfts.badges
      ].sort((a, b) => 
        new Date(b.issuedAt) - new Date(a.issuedAt)
      ).slice(0, 5),
      stats: student.stats
    };
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(metric = 'coursesCompleted', limit = 10) {
    const students = Array.from(this.storage.values());
    
    students.sort((a, b) => {
      if (metric === 'coursesCompleted') {
        return b.stats.coursesCompleted - a.stats.coursesCompleted;
      }
      if (metric === 'currentStreak') {
        return b.stats.currentStreak - a.stats.currentStreak;
      }
      return 0;
    });

    return students.slice(0, limit).map((student, index) => ({
      rank: index + 1,
      studentId: student.id,
      tier: student.tier,
      value: student.stats[metric],
      nftCount: student.nfts.certificates.length +
                student.nfts.achievements.length +
                student.nfts.badges.length
    }));
  }
}

export default ProgressTracker;
