import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import './PlaygroundHub.css';

const PlaygroundHub = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState({
    experimentsCompleted: 0,
    certificatesEarned: 0,
    playgroundLevel: 1,
    totalPoints: 0
  });

  useEffect(() => {
    // TODO: Fetch user playground statistics from API
    // This should integrate with Vault33 Gatekeeper for user verification
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/playground/stats', {
      //   headers: { 'Authorization': `Bearer ${userToken}` }
      // });
      // const stats = await response.json();

      // Mock data for now
      setUserStats({
        experimentsCompleted: 12,
        certificatesEarned: 3,
        playgroundLevel: 2,
        totalPoints: 850
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const playgroundSections = [
    {
      id: 'ai-experiments',
      title: 'AI Experiments',
      description: 'Explore ChatGPT, image generation, and AI-powered tools',
      icon: '🤖',
      path: '/playground/user/ai',
      difficulty: 'Beginner',
      experiments: 8,
      status: 'active'
    },
    {
      id: 'web3-sandbox',
      title: 'Web3 Sandbox',
      description: 'Test wallets, NFTs, and blockchain interactions',
      icon: '⛓️',
      path: '/playground/user/web3',
      difficulty: 'Intermediate',
      experiments: 12,
      status: 'active'
    },
    {
      id: 'dev-tools',
      title: 'Developer Tools',
      description: 'Advanced APIs, smart contracts, and integrations',
      icon: '🛠️',
      path: '/playground/dev',
      difficulty: 'Advanced',
      experiments: 15,
      status: 'premium'
    },
    {
      id: 'marketplace-lab',
      title: 'Marketplace Lab',
      description: 'Test contractor features and project management',
      icon: '💼',
      path: '/playground/marketplace',
      difficulty: 'Professional',
      experiments: 6,
      status: 'beta'
    }
  ];

  const achievements = [
    {
      id: 'first-experiment',
      title: 'First Steps',
      description: 'Complete your first playground experiment',
      icon: '🎯',
      earned: true,
      points: 50
    },
    {
      id: 'ai-explorer',
      title: 'AI Explorer',
      description: 'Complete 5 AI experiments',
      icon: '🧠',
      earned: true,
      points: 100
    },
    {
      id: 'web3-pioneer',
      title: 'Web3 Pioneer',
      description: 'Complete 10 Web3 experiments',
      icon: '🚀',
      earned: false,
      points: 200
    }
  ];

  return (
    <div className="playground-hub">
      <div className="hub-header">
        <h1 className="hub-title">WIRED CHAOS Playground</h1>
        <p className="hub-subtitle">Experiment, Learn, Build, Earn</p>

        <div className="user-stats">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{userStats.experimentsCompleted}</span>
              <span className="stat-label">Experiments</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userStats.certificatesEarned}</span>
              <span className="stat-label">Certificates</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">L{userStats.playgroundLevel}</span>
              <span className="stat-label">Level</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userStats.totalPoints}</span>
              <span className="stat-label">Points</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="playground-tabs">
        <TabsList className="tabs-list">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="tab-content">
          <div className="playground-grid">
            {playgroundSections.map((section) => (
              <Card key={section.id} className="playground-card">
                <CardHeader>
                  <div className="card-header-content">
                    <div className="section-icon">{section.icon}</div>
                    <div className="section-info">
                      <CardTitle>{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                  <div className="section-badges">
                    <Badge variant={section.status === 'active' ? 'default' : 'secondary'}>
                      {section.status}
                    </Badge>
                    <Badge variant="outline">{section.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="section-stats">
                    <span className="experiment-count">{section.experiments} experiments</span>
                  </div>
                  <Button
                    className="launch-button"
                    disabled={section.status === 'premium' || section.status === 'beta'}
                  >
                    Launch Playground
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="experiments" className="tab-content">
          <div className="experiments-section">
            <h2>Recent Experiments</h2>
            {/* TODO: Implement experiment history and favorites */}
            <div className="experiments-placeholder">
              <p>Your experiment history will appear here.</p>
              <Button>Browse All Experiments</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="tab-content">
          <div className="achievements-section">
            <h2>Achievements</h2>
            <div className="achievements-grid">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}>
                  <CardContent>
                    <div className="achievement-icon">{achievement.icon}</div>
                    <h3 className="achievement-title">{achievement.title}</h3>
                    <p className="achievement-description">{achievement.description}</p>
                    <div className="achievement-points">+{achievement.points} points</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="tab-content">
          <div className="progress-section">
            <h2>Learning Path Progress</h2>
            {/* TODO: Implement progress tracking and learning paths */}
            <div className="progress-placeholder">
              <p>Track your learning progress across different skill areas.</p>
              <Button>View Detailed Progress</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlaygroundHub;
