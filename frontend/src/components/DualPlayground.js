import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { verifyHolderStatus } from '../lib/wallet-verification';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

// Dual Playground Architecture - User & Developer Modes
const DualPlayground = () => {
  const { isConnected, walletAddress } = useWallet();
  const [holderStatus, setHolderStatus] = useState(null);
  const [activeMode, setActiveMode] = useState('user');
  const [playgroundProjects, setPlaygroundProjects] = useState([]);

  useEffect(() => {
    if (isConnected && walletAddress) {
      verifyHolderStatus(walletAddress).then(setHolderStatus);
      loadPlaygroundProjects();
    }
  }, [isConnected, walletAddress]);

  const loadPlaygroundProjects = async () => {
    try {
      const response = await fetch(`/api/playground/projects/${walletAddress}`);
      const projects = await response.json();
      setPlaygroundProjects(projects);
    } catch (error) {
      console.error('Failed to load playground projects:', error);
    }
  };

  const UserPlayground = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* AI Tools Section */}
        <Card className="bg-black/20 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center">
              🤖 AI Swarm Agents
              {holderStatus?.isHolder && (
                <Badge className="ml-2 bg-purple-600">Premium</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                EdgeGuide AI
              </Button>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                WalletCoach Pro
              </Button>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                TrustTaxClerk
              </Button>
              {holderStatus?.isHolder && (
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  VaultGuardian AI
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AR/VR Models Section */}
        <Card className="bg-black/20 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">🥽 AR/VR Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                3D Model Viewer
              </Button>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                WebXR Sandbox
              </Button>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                Metaverse Assets
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* NFT Preview Section */}
        <Card className="bg-black/20 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">🎨 NFT Playground</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full bg-pink-600 hover:bg-pink-700">
                Mint Simulator
              </Button>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                Testnet Sandbox
              </Button>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Collection Builder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Web3 Learning Labs */}
      <Card className="bg-black/20 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400">🎓 Web3 Learning Labs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Interactive Tutorials</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  🔗 Blockchain Basics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  💰 DeFi Fundamentals
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🎨 NFT Creation
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Gamification</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                  <span className="text-white">XP Points</span>
                  <Badge className="bg-green-600">2,450 XP</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                  <span className="text-white">Badges Earned</span>
                  <Badge className="bg-blue-600">7 / 15</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-black/30 rounded">
                  <span className="text-white">Vault Access</span>
                  <Badge className={holderStatus?.isHolder ? "bg-purple-600" : "bg-gray-600"}>
                    {holderStatus?.isHolder ? "GRANTED" : "LOCKED"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DeveloperPlayground = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Sandbox */}
        <Card className="bg-black/20 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">💻 Code Sandbox</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm">
                <div className="text-green-400">// Live coding environment</div>
                <div className="text-white">import React from 'react';</div>
                <div className="text-blue-400">const MyComponent = () => {'{'}</div>
                <div className="text-white ml-4">return &lt;div&gt;Hello WIRED CHAOS&lt;/div&gt;</div>
                <div className="text-blue-400">{'}'}</div>
              </div>
              <div className="flex space-x-2">
                <Button className="bg-green-600 hover:bg-green-700">
                  Run Code
                </Button>
                <Button variant="outline">
                  Save Project
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Tester */}
        <Card className="bg-black/20 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">🧪 API Tester</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <select className="w-full p-2 bg-black/50 border border-gray-600 rounded text-white">
                <option>/api/swarm/agents</option>
                <option>/api/marketplace/rfps</option>
                <option>/api/contractors/profiles</option>
                <option>/api/escrow/status</option>
              </select>
              <div className="flex space-x-2">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  GET
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  POST
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  PUT
                </Button>
              </div>
              <div className="bg-black/50 p-3 rounded text-xs text-green-400 font-mono">
                {"{"} "status": "success", "data": [...] {"}"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RFP Workspace */}
      <Card className="bg-black/20 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400">📋 RFP Response Workspace</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-3">Project Builder</h3>
              <div className="bg-black/50 p-4 rounded-lg">
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Project Title"
                    className="w-full p-2 bg-black/30 border border-gray-600 rounded text-white"
                  />
                  <textarea 
                    placeholder="Technical Approach & Implementation Details..."
                    rows="6"
                    className="w-full p-2 bg-black/30 border border-gray-600 rounded text-white"
                  />
                  <div className="flex space-x-2">
                    <Button className="bg-cyan-600 hover:bg-cyan-700">
                      Generate Prototype
                    </Button>
                    <Button variant="outline">
                      Save Draft
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">My Projects</h3>
              <div className="space-y-2">
                {playgroundProjects.map((project, index) => (
                  <div key={index} className="p-3 bg-black/30 rounded border border-gray-600">
                    <div className="text-white font-medium">{project.title}</div>
                    <div className="text-gray-400 text-sm">{project.status}</div>
                    <Badge className={project.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}>
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contractor Profile Preview */}
      <Card className="bg-black/20 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400">👤 Contractor Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Skills & Portfolio</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-600">React</Badge>
                  <Badge className="bg-green-600">Web3</Badge>
                  <Badge className="bg-purple-600">Solidity</Badge>
                  <Badge className="bg-orange-600">AI/ML</Badge>
                </div>
                <div className="mt-4">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Update Profile
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Performance Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed Projects</span>
                  <span className="text-white">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Rating</span>
                  <span className="text-yellow-400">★★★★★ 4.8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">On-Time Delivery</span>
                  <span className="text-green-400">95%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="bg-black/20 border-cyan-500/30 p-8">
          <CardContent className="text-center">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Connect Wallet to Access Playground
            </h2>
            <p className="text-gray-400 mb-6">
              Connect your Web3 wallet to access the WIRED CHAOS playground and marketplace
            </p>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-4">
            WIRED CHAOS Playground
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Dual playground environment for users and developers. Build, test, and deploy in the Web3 ecosystem.
          </p>
          {holderStatus?.isHolder && (
            <Badge className="mt-2 bg-purple-600 text-white">
              🎭 Vault Holder - Premium Access
            </Badge>
          )}
        </div>

        {/* Mode Toggle */}
        <Tabs value={activeMode} onValueChange={setActiveMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/30 border border-cyan-500/30">
            <TabsTrigger 
              value="user" 
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              🎮 User Playground
            </TabsTrigger>
            <TabsTrigger 
              value="developer"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              💻 Developer Playground
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="mt-6">
            <UserPlayground />
          </TabsContent>

          <TabsContent value="developer" className="mt-6">
            <DeveloperPlayground />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DualPlayground;