/**
 * Grants for Founders - Educational Course Module
 *
 * Modular lessons on how to secure grants including:
 * - Basics & fundamentals
 * - Eligibility assessment
 * - Grant discovery
 * - Application writing
 * - Submission best practices
 * - Status monitoring
 * - Case studies
 *
 * Features upsell CTAs for 1:1 strategy, SWARM automation, and enterprise WL solutions.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const GrantsForFounders = () => {
  const navigate = useNavigate();
  const [currentModule, setCurrentModule] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);

  const modules = [
    {
      id: "module-1",
      title: "Module 1: Grant Basics & Fundamentals",
      icon: "📚",
      duration: "30 min",
      description: "Understanding what grants are, types of grants, and how they work",
      lessons: [
        "What are grants and how do they differ from loans?",
        "Types of grants: Government, Foundation, Corporate, Web3",
        "Grant lifecycle: Discovery to award",
        "Common misconceptions about grants",
      ],
      quiz: [
        "What is the key difference between a grant and a loan?",
        "Name three types of grant sources",
      ],
    },
    {
      id: "module-2",
      title: "Module 2: Eligibility Assessment",
      icon: "✅",
      duration: "45 min",
      description: "Learn how to determine which grants you qualify for",
      lessons: [
        "Understanding eligibility criteria",
        "Legal structure requirements (LLC, nonprofit, etc.)",
        "Industry and tag-based matching",
        "Geographic restrictions and requirements",
      ],
      quiz: [
        "What are the three main eligibility factors?",
        "How do tags help with grant matching?",
      ],
    },
    {
      id: "module-3",
      title: "Module 3: Grant Discovery Strategies",
      icon: "🔍",
      duration: "60 min",
      description: "Master the art of finding relevant grant opportunities",
      lessons: [
        "RSS feeds and automated discovery",
        "Grant databases and APIs",
        "Web3-specific grant platforms (Gitcoin, SWARM)",
        "Women in Tech and nonprofit grant sources",
        "Setting up alerts and notifications",
      ],
      quiz: ["Name three grant discovery methods", "What is the SWARM RSS feed?"],
    },
    {
      id: "module-4",
      title: "Module 4: Application Writing Excellence",
      icon: "✍️",
      duration: "90 min",
      description: "Craft compelling grant applications that win funding",
      lessons: [
        "Understanding what reviewers look for",
        "Writing an executive summary",
        "Project description and methodology",
        "Budget justification best practices",
        "Impact statements that resonate",
        "Sustainability and long-term vision",
      ],
      quiz: [
        "What are the key components of a grant application?",
        "How do you write an effective budget justification?",
      ],
    },
    {
      id: "module-5",
      title: "Module 5: Submission Best Practices",
      icon: "📤",
      duration: "45 min",
      description: "Navigate the submission process with confidence",
      lessons: [
        "Submission methods: API, email, portal, document",
        "Required documents and attachments",
        "Deadline management and planning",
        "Follow-up and communication",
        "Common submission mistakes to avoid",
      ],
      quiz: ["What are the four main submission methods?", "What should you do after submitting?"],
    },
    {
      id: "module-6",
      title: "Module 6: Status Monitoring & Follow-up",
      icon: "👁️",
      duration: "30 min",
      description: "Track your applications and respond to feedback",
      lessons: [
        "Setting up status monitoring",
        "Understanding grant review timelines",
        "Responding to requests for information",
        "Handling rejections and learning from feedback",
        "Celebrating acceptances and next steps",
      ],
      quiz: [
        "How can you monitor application status?",
        "What should you do if your application is rejected?",
      ],
    },
    {
      id: "module-7",
      title: "Module 7: Case Studies & Success Stories",
      icon: "🏆",
      duration: "60 min",
      description: "Learn from real-world grant success stories",
      lessons: [
        "Case Study: Women-owned Web3 startup wins $50K grant",
        "Case Study: Nonprofit tech grant success",
        "Case Study: Blockchain innovation grant",
        "Lessons learned from failed applications",
        "Expert interviews and insights",
      ],
      quiz: [
        "What made the successful applications stand out?",
        "Name three key learnings from case studies",
      ],
    },
  ];

  const handleModuleClick = (module) => {
    setCurrentModule(module);
  };

  const handleCompleteModule = (moduleId) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules([...completedModules, moduleId]);
    }
    setCurrentModule(null);
  };

  const progress = (completedModules.length / modules.length) * 100;

  return (
    <div
      className="grants-edu-container"
      style={{ padding: "40px", minHeight: "100vh", background: "#000" }}
    >
      {/* Header */}
      <div className="grants-header" style={{ marginBottom: "40px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "48px",
            color: "#00FFFF",
            marginBottom: "10px",
            fontWeight: "bold",
          }}
        >
          🎓 Grants for Founders
        </h1>
        <p style={{ fontSize: "20px", color: "#39FF14", marginBottom: "20px" }}>
          Master the art of securing grants for your organization
        </p>

        {/* Progress Bar */}
        <div style={{ maxWidth: "600px", margin: "0 auto", marginTop: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              color: "#fff",
            }}
          >
            <span>Progress</span>
            <span>
              {completedModules.length} / {modules.length} modules completed
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "20px",
              background: "#333",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #00FFFF, #39FF14)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Module View or Course List */}
      {currentModule ? (
        <ModuleDetail
          module={currentModule}
          onComplete={handleCompleteModule}
          onBack={() => setCurrentModule(null)}
        />
      ) : (
        <>
          {/* Module Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "30px",
              marginBottom: "60px",
            }}
          >
            {modules.map((module) => {
              const isCompleted = completedModules.includes(module.id);
              return (
                <Card
                  key={module.id}
                  className="module-card"
                  onClick={() => handleModuleClick(module)}
                  style={{
                    cursor: "pointer",
                    padding: "30px",
                    background: isCompleted ? "#1a3a1a" : "#1a1a2e",
                    border: isCompleted ? "2px solid #39FF14" : "2px solid #00FFFF",
                    transition: "all 0.3s ease",
                    position: "relative",
                  }}
                >
                  {isCompleted && (
                    <div
                      style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        color: "#39FF14",
                        fontSize: "24px",
                      }}
                    >
                      ✓
                    </div>
                  )}

                  <div style={{ fontSize: "48px", marginBottom: "15px" }}>{module.icon}</div>

                  <h3
                    style={{
                      color: "#00FFFF",
                      fontSize: "20px",
                      marginBottom: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    {module.title}
                  </h3>

                  <p
                    style={{
                      color: "#fff",
                      fontSize: "14px",
                      marginBottom: "15px",
                      opacity: 0.8,
                    }}
                  >
                    {module.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#39FF14",
                      fontSize: "12px",
                    }}
                  >
                    <span>⏱️ {module.duration}</span>
                    <span>•</span>
                    <span>{module.lessons.length} lessons</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Upsell Section */}
          <UpsellSection navigate={navigate} />
        </>
      )}
    </div>
  );
};

const ModuleDetail = ({ module, onComplete, onBack }) => {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <div className="module-detail" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <Button
        onClick={onBack}
        style={{ marginBottom: "30px", background: "#333", color: "#00FFFF" }}
      >
        ← Back to Courses
      </Button>

      <Card style={{ padding: "40px", background: "#1a1a2e", border: "2px solid #00FFFF" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>{module.icon}</div>

        <h2 style={{ color: "#00FFFF", fontSize: "32px", marginBottom: "20px" }}>{module.title}</h2>

        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ color: "#39FF14", fontSize: "20px", marginBottom: "15px" }}>Lessons:</h3>
          {module.lessons.map((lesson, idx) => (
            <div
              key={idx}
              style={{
                padding: "15px",
                marginBottom: "10px",
                background: currentLesson === idx ? "#00FFFF22" : "#ffffff11",
                border: currentLesson === idx ? "1px solid #00FFFF" : "1px solid #333",
                borderRadius: "8px",
                color: "#fff",
                cursor: "pointer",
              }}
              onClick={() => setCurrentLesson(idx)}
            >
              {idx + 1}. {lesson}
            </div>
          ))}
        </div>

        {/* Lesson Content */}
        <div
          style={{
            padding: "30px",
            background: "#000",
            borderRadius: "8px",
            marginBottom: "30px",
            minHeight: "200px",
          }}
        >
          <h4 style={{ color: "#00FFFF", marginBottom: "15px" }}>
            Lesson {currentLesson + 1}: {module.lessons[currentLesson]}
          </h4>
          <p style={{ color: "#fff", lineHeight: "1.8" }}>
            [Content for this lesson would be displayed here. In production, this would include
            detailed explanations, examples, videos, and interactive elements.]
          </p>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <Button
            onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
            disabled={currentLesson === 0}
            style={{ background: "#333", color: "#00FFFF" }}
          >
            Previous Lesson
          </Button>

          {currentLesson < module.lessons.length - 1 ? (
            <Button
              onClick={() => setCurrentLesson(currentLesson + 1)}
              style={{ background: "#00FFFF", color: "#000" }}
            >
              Next Lesson →
            </Button>
          ) : (
            <Button
              onClick={() => setShowQuiz(true)}
              style={{ background: "#39FF14", color: "#000" }}
            >
              Take Quiz 📝
            </Button>
          )}
        </div>

        {/* Quiz Section */}
        {showQuiz && (
          <div
            style={{
              padding: "30px",
              background: "#39FF1422",
              border: "2px solid #39FF14",
              borderRadius: "8px",
              marginTop: "20px",
            }}
          >
            <h4 style={{ color: "#39FF14", marginBottom: "20px" }}>Module Quiz</h4>
            {module.quiz.map((question, idx) => (
              <div key={idx} style={{ marginBottom: "15px", color: "#fff" }}>
                <p>
                  {idx + 1}. {question}
                </p>
                <input
                  type="text"
                  placeholder="Your answer..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    background: "#000",
                    border: "1px solid #39FF14",
                    color: "#fff",
                    borderRadius: "4px",
                  }}
                />
              </div>
            ))}
            <Button
              onClick={() => onComplete(module.id)}
              style={{
                marginTop: "20px",
                background: "#39FF14",
                color: "#000",
                width: "100%",
              }}
            >
              Complete Module ✓
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

const UpsellSection = ({ navigate }) => {
  const upsells = [
    {
      title: "1:1 Grant Strategy Consulting",
      icon: "🎯",
      description:
        "Work directly with our grant experts to develop a personalized grant strategy for your organization.",
      price: "Starting at $500",
      cta: "Book Consultation",
      action: () => navigate("/contact?service=grant-strategy"),
      color: "#00FFFF",
    },
    {
      title: "SWARM Grant Automation",
      icon: "🤖",
      description:
        "Automate your grant discovery, application drafting, and submission process with our AI-powered SWARM system.",
      price: "Starting at $2,500/mo",
      cta: "Get SWARM",
      action: () => navigate("/vsp?package=enterprise"),
      color: "#FF00FF",
    },
    {
      title: "Enterprise White-Label Solution",
      icon: "🏢",
      description:
        "Deploy a fully branded grant management platform for your organization or clients.",
      price: "Custom pricing",
      cta: "Schedule Demo",
      action: () => navigate("/b2b?solution=white-label"),
      color: "#39FF14",
    },
  ];

  return (
    <div style={{ marginTop: "80px", marginBottom: "40px" }}>
      <h2
        style={{
          color: "#FF00FF",
          textAlign: "center",
          fontSize: "36px",
          marginBottom: "40px",
          fontWeight: "bold",
        }}
      >
        Ready to Level Up Your Grant Game?
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
        }}
      >
        {upsells.map((upsell, idx) => (
          <Card
            key={idx}
            style={{
              padding: "30px",
              background: "#1a1a2e",
              border: `2px solid ${upsell.color}`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>{upsell.icon}</div>

            <h3
              style={{
                color: upsell.color,
                fontSize: "24px",
                marginBottom: "15px",
                fontWeight: "bold",
              }}
            >
              {upsell.title}
            </h3>

            <p
              style={{
                color: "#fff",
                marginBottom: "20px",
                lineHeight: "1.6",
              }}
            >
              {upsell.description}
            </p>

            <p
              style={{
                color: "#39FF14",
                fontSize: "18px",
                marginBottom: "20px",
                fontWeight: "bold",
              }}
            >
              {upsell.price}
            </p>

            <Button
              onClick={upsell.action}
              style={{
                background: upsell.color,
                color: "#000",
                width: "100%",
                fontWeight: "bold",
              }}
            >
              {upsell.cta}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GrantsForFounders;
