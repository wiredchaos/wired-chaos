import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { verifyHolderStatus } from '../lib/wallet-verification';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';

// Contractor Marketplace System
const ContractorMarketplace = () => {
  const { isConnected, walletAddress } = useWallet();
  const [holderStatus, setHolderStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [rfps, setRfps] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (isConnected && walletAddress) {
      verifyHolderStatus(walletAddress).then(setHolderStatus);
      loadRFPs();
      loadMyBids();
      loadProfile();
    }
  }, [isConnected, walletAddress]);

  const loadRFPs = async () => {
    try {
      const response = await fetch('/api/marketplace/rfps');
      const data = await response.json();
      setRfps(data);
    } catch (error) {
      console.error('Failed to load RFPs:', error);
    }
  };

  const loadMyBids = async () => {
    try {
      const response = await fetch(`/api/marketplace/bids/contractor/${walletAddress}`);
      const data = await response.json();
      setMyBids(data);
    } catch (error) {
      console.error('Failed to load bids:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/contractors/profile/${walletAddress}`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const RFPCreator = () => {
    const [rfpData, setRfpData] = useState({
      title: '',
      description: '',
      budget: '',
      currency: 'ETH',
      deadline: '',
      requiredSkills: [],
      holderOnly: false
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('/api/marketplace/rfp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...rfpData,
            creatorWallet: walletAddress,
            platformFee: holderStatus?.isHolder ? 0 : 0.025
          })
        });
        
        if (response.ok) {
          alert('RFP created successfully!');
          setRfpData({
            title: '',
            description: '',
            budget: '',
            currency: 'ETH',
            deadline: '',
            requiredSkills: [],
            holderOnly: false
          });
          loadRFPs();
        }
      } catch (error) {
        console.error('Failed to create RFP:', error);
      }
    };

    return (
      <Card className="bg-black/20 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400">📋 Create RFP/SOW</CardTitle>
          {holderStatus?.isHolder && (
            <Badge className="w-fit bg-purple-600">
              0% Platform Fee - Holder Benefit
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Project Title"
              value={rfpData.title}
              onChange={(e) => setRfpData({...rfpData, title: e.target.value})}
              className="bg-black/30 border-gray-600 text-white"
              required
            />
            
            <textarea
              placeholder="Project Description & Requirements"
              value={rfpData.description}
              onChange={(e) => setRfpData({...rfpData, description: e.target.value})}
              className="w-full p-3 bg-black/30 border border-gray-600 rounded text-white"
              rows="5"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Budget Amount"
                value={rfpData.budget}
                onChange={(e) => setRfpData({...rfpData, budget: e.target.value})}
                className="bg-black/30 border-gray-600 text-white"
                required
              />
              <select
                value={rfpData.currency}
                onChange={(e) => setRfpData({...rfpData, currency: e.target.value})}
                className="p-2 bg-black/30 border border-gray-600 rounded text-white"
              >
                <option value="ETH">ETH</option>
                <option value="SOL">SOL</option>
                <option value="XRP">XRP</option>
                <option value="HBAR">HBAR</option>
                <option value="DOGE">DOGE</option>
              </select>
            </div>

            <Input
              type="date"
              value={rfpData.deadline}
              onChange={(e) => setRfpData({...rfpData, deadline: e.target.value})}
              className="bg-black/30 border-gray-600 text-white"
              required
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="holderOnly"
                checked={rfpData.holderOnly}
                onChange={(e) => setRfpData({...rfpData, holderOnly: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="holderOnly" className="text-white">
                Vault Holders Only (Premium RFP)
              </label>
            </div>

            <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700">
              Create RFP
              {!holderStatus?.isHolder && (
                <span className="ml-2 text-xs">(2.5% platform fee)</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  const RFPBrowser = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Available RFPs</h2>
        <div className="flex space-x-2">
          <Badge className="bg-blue-600">
            {rfps.filter(rfp => !rfp.holderOnly).length} Standard
          </Badge>
          <Badge className="bg-purple-600">
            {rfps.filter(rfp => rfp.holderOnly).length} Premium
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rfps.map((rfp, index) => (
          <Card key={index} className={`bg-black/20 border-2 ${rfp.holderOnly ? 'border-purple-500/50' : 'border-cyan-500/30'}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white">{rfp.title}</CardTitle>
                {rfp.holderOnly && (
                  <Badge className="bg-purple-600">Premium</Badge>
                )}
              </div>
              <div className="flex space-x-4 text-sm text-gray-400">
                <span>💰 {rfp.budget.amount} {rfp.budget.currency}</span>
                <span>📅 Due: {new Date(rfp.deadline).toLocaleDateString()}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">{rfp.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {rfp.requiredSkills.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-cyan-400">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="flex space-x-2">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={rfp.holderOnly && !holderStatus?.isHolder}
                >
                  Submit Bid
                </Button>
                <Button variant="outline" className="flex-1">
                  View Details
                </Button>
              </div>

              {rfp.holderOnly && !holderStatus?.isHolder && (
                <p className="text-red-400 text-xs mt-2">
                  🔒 Vault Holder access required
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ContractorProfile = () => (
    <Card className="bg-black/20 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-cyan-400">👤 Contractor Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Display Name</label>
              <Input
                value={profile?.displayName || ''}
                placeholder="Your professional name"
                className="bg-black/30 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-white mb-2">Bio</label>
              <textarea
                value={profile?.bio || ''}
                placeholder="Tell clients about your expertise..."
                className="w-full p-3 bg-black/30 border border-gray-600 rounded text-white"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profile?.skills?.map((skill, idx) => (
                  <Badge key={idx} className="bg-blue-600">
                    {skill}
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add skills (React, Web3, Solidity...)"
                className="bg-black/30 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/30 rounded border border-gray-600">
                <div className="text-2xl font-bold text-cyan-400">
                  {profile?.completedProjects || 0}
                </div>
                <div className="text-sm text-gray-400">Completed Projects</div>
              </div>
              
              <div className="p-4 bg-black/30 rounded border border-gray-600">
                <div className="text-2xl font-bold text-yellow-400">
                  ★ {profile?.averageRating || '0.0'}
                </div>
                <div className="text-sm text-gray-400">Average Rating</div>
              </div>
              
              <div className="p-4 bg-black/30 rounded border border-gray-600">
                <div className="text-2xl font-bold text-green-400">
                  {profile?.onTimeDelivery || 0}%
                </div>
                <div className="text-sm text-gray-400">On-Time Delivery</div>
              </div>
              
              <div className="p-4 bg-black/30 rounded border border-gray-600">
                <div className="text-2xl font-bold text-purple-400">
                  {profile?.nftBadges?.length || 0}
                </div>
                <div className="text-sm text-gray-400">NFT Badges</div>
              </div>
            </div>

            {/* Holder Benefits */}
            {holderStatus?.isHolder && (
              <div className="p-4 bg-purple-900/30 rounded border border-purple-500/50">
                <h4 className="text-purple-400 font-semibold mb-2">🎭 Holder Benefits</h4>
                <ul className="text-sm text-white space-y-1">
                  <li>✅ 0% platform fees</li>
                  <li>✅ 2x search ranking boost</li>
                  <li>✅ Premium RFP access</li>
                  <li>✅ Priority support</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            Update Profile
          </Button>
          <Button variant="outline">
            View Public Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const MyBids = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">My Bids</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {myBids.map((bid, index) => (
          <Card key={index} className="bg-black/20 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-white">{bid.rfpTitle}</CardTitle>
              <Badge className={
                bid.status === 'accepted' ? 'bg-green-600' :
                bid.status === 'rejected' ? 'bg-red-600' :
                'bg-yellow-600'
              }>
                {bid.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bid Amount:</span>
                  <span className="text-cyan-400">{bid.proposedAmount.amount} {bid.proposedAmount.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Timeline:</span>
                  <span className="text-white">{bid.timeline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Submitted:</span>
                  <span className="text-white">{new Date(bid.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              {bid.playgroundDemoUrl && (
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    View Demo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="bg-black/20 border-cyan-500/30 p-8">
          <CardContent className="text-center">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Connect Wallet to Access Marketplace
            </h2>
            <p className="text-gray-400 mb-6">
              Connect your Web3 wallet to access the contractor marketplace
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
            Contractor Marketplace
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Web3 contractor ecosystem with RFP/SOW management, escrow, and holder benefits
          </p>
          {holderStatus?.isHolder && (
            <Badge className="mt-2 bg-purple-600 text-white">
              🎭 Vault Holder - Premium Benefits Active
            </Badge>
          )}
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 border border-cyan-500/30">
            <TabsTrigger 
              value="browse" 
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              🔍 Browse RFPs
            </TabsTrigger>
            <TabsTrigger 
              value="create"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              📋 Create RFP
            </TabsTrigger>
            <TabsTrigger 
              value="bids"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              💰 My Bids
            </TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              👤 Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <RFPBrowser />
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <RFPCreator />
          </TabsContent>

          <TabsContent value="bids" className="mt-6">
            <MyBids />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <ContractorProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContractorMarketplace;