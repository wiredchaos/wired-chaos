/**
 * WIRED CHAOS - Course Player Component
 * Video learning interface with progress tracking
 */

import React, { useState, useRef, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import './CoursePlayer.css';

const CoursePlayer = ({ course, onProgressUpdate, onCourseComplete }) => {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showNotes, setShowNotes] = useState(true);
  const [courseProgress, setCourseProgress] = useState(0);

  // Mock course data structure
  const courseData = course || {
    id: 'bc-101',
    title: 'Blockchain Basics',
    tier: 'community',
    instructor: 'WIRED CHAOS Faculty',
    duration: '4 weeks',
    lessons: [
      {
        id: 'lesson-1',
        title: 'What is Blockchain?',
        duration: 300,
        video: {
          id: 'video-1',
          title: 'What is Blockchain?',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
          duration: 596
        },
        notes: 'Key concepts: distributed ledger, consensus, immutability'
      },
      {
        id: 'lesson-2',
        title: 'Setting Up Your First Wallet',
        duration: 420,
        video: {
          id: 'video-2',
          title: 'Setting Up Your First Wallet',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
          duration: 15
        },
        notes: 'Wallet types: Hot vs Cold wallets, security best practices'
      },
      {
        id: 'lesson-3',
        title: 'Making Your First Transaction',
        duration: 360,
        video: {
          id: 'video-3',
          title: 'Making Your First Transaction',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
          duration: 653
        },
        notes: 'Understanding gas fees, transaction confirmation, blockchain explorers'
      }
    ]
  };

  const currentLessonData = courseData.lessons[currentLesson];
  const totalLessons = courseData.lessons.length;

  useEffect(() => {
    // Calculate overall course progress
    const progress = Math.round((completedLessons.length / totalLessons) * 100);
    setCourseProgress(progress);
    
    if (onProgressUpdate) {
      onProgressUpdate({
        courseId: courseData.id,
        lessonId: currentLessonData.id,
        progress
      });
    }
  }, [completedLessons, currentLesson]);

  const handleVideoEnd = () => {
    // Mark lesson as completed
    if (!completedLessons.includes(currentLessonData.id)) {
      const newCompleted = [...completedLessons, currentLessonData.id];
      setCompletedLessons(newCompleted);

      // Check if course is complete
      if (newCompleted.length === totalLessons && onCourseComplete) {
        onCourseComplete(courseData.id);
      }
    }

    // Auto-advance to next lesson if available
    if (currentLesson < totalLessons - 1) {
      setTimeout(() => {
        setCurrentLesson(currentLesson + 1);
      }, 2000);
    }
  };

  const goToLesson = (index) => {
    setCurrentLesson(index);
  };

  const isLessonCompleted = (lessonId) => {
    return completedLessons.includes(lessonId);
  };

  return (
    <div className="course-player">
      <div className="player-container">
        {/* Course Header */}
        <div className="course-header">
          <div className="course-info">
            <h1 className="course-title">{courseData.title}</h1>
            <div className="course-meta">
              <span className="meta-item">
                <span className="meta-icon">👨‍🏫</span>
                {courseData.instructor}
              </span>
              <span className="meta-item">
                <span className="meta-icon">📚</span>
                {totalLessons} Lessons
              </span>
              <span className="meta-item">
                <span className="meta-icon">⏱️</span>
                {courseData.duration}
              </span>
              <span className={`tier-badge ${courseData.tier}`}>
                {courseData.tier === 'community' ? 'Community' : 'Business School'}
              </span>
            </div>
          </div>
          <div className="course-progress-summary">
            <div className="progress-circle">
              <svg width="80" height="80">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="rgba(0, 255, 255, 0.2)"
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="#00FFFF"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 35}`}
                  strokeDashoffset={`${2 * Math.PI * 35 * (1 - courseProgress / 100)}`}
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <div className="progress-text">{courseProgress}%</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="player-layout">
          {/* Video Player */}
          <div className="video-section">
            <h2 className="lesson-title">
              Lesson {currentLesson + 1}: {currentLessonData.title}
            </h2>
            <VideoPlayer
              video={currentLessonData.video}
              config={{
                autoplay: false,
                controls: true,
                showAvatar: false
              }}
              onVideoEnd={handleVideoEnd}
            />
            
            {/* Lesson Controls */}
            <div className="lesson-controls">
              <button
                className="control-button"
                onClick={() => goToLesson(Math.max(0, currentLesson - 1))}
                disabled={currentLesson === 0}
              >
                ⏮️ Previous
              </button>
              <button className="control-button" onClick={() => setShowNotes(!showNotes)}>
                📝 {showNotes ? 'Hide' : 'Show'} Notes
              </button>
              <button
                className="control-button"
                onClick={() => goToLesson(Math.min(totalLessons - 1, currentLesson + 1))}
                disabled={currentLesson === totalLessons - 1}
              >
                Next ⏭️
              </button>
            </div>

            {/* Lesson Notes */}
            {showNotes && (
              <div className="lesson-notes">
                <h3>Lesson Notes</h3>
                <p>{currentLessonData.notes}</p>
              </div>
            )}
          </div>

          {/* Lesson List Sidebar */}
          <div className="lessons-sidebar">
            <h3 className="sidebar-title">Course Lessons</h3>
            <div className="lessons-list">
              {courseData.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`lesson-item ${currentLesson === index ? 'active' : ''} ${
                    isLessonCompleted(lesson.id) ? 'completed' : ''
                  }`}
                  onClick={() => goToLesson(index)}
                >
                  <div className="lesson-number">
                    {isLessonCompleted(lesson.id) ? '✓' : index + 1}
                  </div>
                  <div className="lesson-details">
                    <div className="lesson-name">{lesson.title}</div>
                    <div className="lesson-duration">
                      {Math.floor(lesson.duration / 60)} min
                    </div>
                  </div>
                  {currentLesson === index && <div className="playing-indicator">▶</div>}
                </div>
              ))}
            </div>

            {/* Course Completion */}
            {courseProgress === 100 && (
              <div className="completion-banner">
                <div className="completion-icon">🎉</div>
                <div className="completion-text">
                  <strong>Course Complete!</strong>
                  <p>Your NFT certificate is being issued</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
