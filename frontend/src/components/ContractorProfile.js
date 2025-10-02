import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { verifyHolderStatus } from '../lib/wallet-verification';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export default function ContractorProfile() {
  const { walletAddress, isConnected } = useWallet();
  const [holderStatus, setHolderStatus] = useState(null);
  const [profile, setProfile] = useState({
    display_name: '',
    bio: '',
    skills: [],
    portfolio_items: [],
    nft_badges: [],
    performance_metrics: {
      completed_projects: 0,
      average_rating: 0.0,
      on_time_delivery: 0.0
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeProjects, setActiveProjects] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (walletAddress) {
      verifyHolderStatus(walletAddress).then(setHolderStatus);
      fetchProfile();
    }
  }, [walletAddress]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/contractors/profile/${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const updateProfile = async (updatedProfile) => {
    try {
      const response = await fetch(`/api/contractors/profile/${walletAddress}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updatedProfile)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const addSkill = (skill) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-black/40 border-cyan-500/30">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Connect Wallet</h2>
            <p className="text-gray-300">Please connect your wallet to view your contractor profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Profile Header */}
        <Card className="bg-black/20 border-cyan-500/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24 border-2 border-cyan-500">
                  <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${walletAddress}`} />
                  <AvatarFallback className="bg-cyan-900 text-cyan-100">
                    {profile.display_name?.slice(0, 2) || walletAddress?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold text-white">
                      {profile.display_name || `Contractor ${walletAddress?.slice(0, 8)}...`}
                    </h1>
                    {holderStatus?.isHolder && (
                      <Badge className="bg-purple-600 text-white">
                        🎯 VAULT HOLDER
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-400 max-w-md">
                    {profile.bio || "No bio provided yet."}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-cyan-400">
                    <span>📊 {profile.performance_metrics.completed_projects} Projects</span>
                    <span>⭐ {profile.performance_metrics.average_rating.toFixed(1)} Rating</span>
                    <span>⏰ {(profile.performance_metrics.on_time_delivery * 100).toFixed(0)}% On-Time</span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-black/20 border-cyan-500/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills & Badges</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="projects">Active Projects</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Performance Metrics */}
              <Card className="bg-black/20 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-400">📈 Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <span>{(profile.performance_metrics.on_time_delivery * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={profile.performance_metrics.on_time_delivery * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Client Satisfaction</span>
                      <span>{profile.performance_metrics.average_rating.toFixed(1)}/5.0</span>
                    </div>
                    <Progress value={(profile.performance_metrics.average_rating / 5) * 100} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-cyan-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-400">
                        {profile.performance_metrics.completed_projects}
                      </div>
                      <div className="text-sm text-gray-400">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        ${(profile.performance_metrics.completed_projects * 2500).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Total Earned</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Holder Benefits */}
              {holderStatus?.isHolder && (
                <Card className="bg-purple-900/20 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-purple-400">🎯 Holder Benefits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Platform Fee</span>
                      <Badge className="bg-green-600">0% (Free)</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Premium RFPs</span>
                      <Badge className="bg-purple-600">Access Granted</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Search Priority</span>
                      <Badge className="bg-cyan-600">2x Boost</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Advanced Analytics</span>
                      <Badge className="bg-yellow-600">Enabled</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Profile Edit Form */}
            {isEditing && (
              <Card className="bg-black/20 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-400">✏️ Edit Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Display Name
                      </label>
                      <Input
                        value={profile.display_name}
                        onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder="Your professional name"
                        className="bg-black/20 border-cyan-500/30"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    <Textarea
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell clients about your expertise and experience..."
                      rows={4}
                      className="bg-black/20 border-cyan-500/30"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => updateProfile(profile)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save Changes
                    </Button>
                    <Button 
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Skills & Badges Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card className="bg-black/20 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-400">🛠️ Technical Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.skills.map((skill, index) => (
                      <Badge 
                        key={index}
                        className="bg-cyan-900/50 text-cyan-100 hover:bg-cyan-800"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                  
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a skill..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addSkill(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="bg-black/20 border-cyan-500/30"
                      />
                      <Button 
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          addSkill(input.value);
                          input.value = '';
                        }}
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400">🏆 NFT Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.nft_badges.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {profile.nft_badges.map((badge, index) => (
                        <div key={index} className="p-3 bg-purple-900/20 rounded-lg text-center">
                          <div className="text-2xl mb-1">{badge.emoji}</div>
                          <div className="text-sm font-medium">{badge.name}</div>
                          <div className="text-xs text-gray-400">{badge.description}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-2">🎯</div>
                      <p>Complete projects to earn NFT badges!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card className="bg-black/20 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">💼 Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.portfolio_items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profile.portfolio_items.map((item, index) => (
                      <div key={index} className="bg-gray-900/50 rounded-lg p-4">
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {item.technologies.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">📁</div>
                    <h3 className="text-xl font-semibold mb-2">No Portfolio Items Yet</h3>
                    <p>Complete your first project to start building your portfolio!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card className="bg-black/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400">🚀 Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {activeProjects.length > 0 ? (
                  <div className="space-y-4">
                    {activeProjects.map((project, index) => (
                      <div key={index} className="border border-green-500/30 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-white">{project.title}</h3>
                          <Badge className="bg-green-600">In Progress</Badge>
                        </div>
                        <p className="text-gray-400 mb-3">{project.description}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-400">Budget: </span>
                            <span className="text-green-400 font-medium">
                              {project.budget.amount} {project.budget.currency}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Deadline: </span>
                            <span className="text-white">
                              {new Date(project.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Progress value={project.progress} className="mt-3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">⚡</div>
                    <h3 className="text-xl font-semibold mb-2">No Active Projects</h3>
                    <p>Browse RFPs to find your next opportunity!</p>
                    <Button className="mt-4 bg-cyan-600 hover:bg-cyan-700">
                      Browse RFPs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="bg-black/20 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">⭐ Client Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-800 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-yellow-900 text-yellow-100">
                                {review.client_name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-white">{review.client_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-600"}>
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-300">{review.comment}</p>
                        <div className="text-sm text-gray-500 mt-2">
                          {review.project_title} • {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
                    <p>Complete projects to start receiving client feedback!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}