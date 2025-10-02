import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { verifyHolderStatus } from '../lib/wallet-verification';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';

export default function RFPManager() {
  const { walletAddress, isConnected } = useWallet();
  const [holderStatus, setHolderStatus] = useState(null);
  const [rfps, setRfps] = useState([]);
  const [userRfps, setUserRfps] = useState([]);
  const [bids, setBids] = useState({});
  const [newRfp, setNewRfp] = useState({
    title: '',
    description: '',
    budget: { amount: '', currency: 'ETH' },
    deadline: '',
    required_skills: [],
    holder_only: false,
    milestones: []
  });
  const [newBid, setNewBid] = useState({
    proposed_amount: { amount: '', currency: 'ETH' },
    timeline: '',
    approach: '',
    playground_demo_url: ''
  });
  const [selectedRfp, setSelectedRfp] = useState(null);
  const [activeTab, setActiveTab] = useState('browse'); // browse, my-rfps, create

  useEffect(() => {
    if (walletAddress) {
      verifyHolderStatus(walletAddress).then(setHolderStatus);
      fetchRfps();
      fetchUserRfps();
    }
  }, [walletAddress]);

  const fetchRfps = async () => {
    try {
      const response = await fetch(`/api/marketplace/rfps?wallet_address=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        setRfps(data);
      }
    } catch (error) {
      console.error('Failed to fetch RFPs:', error);
    }
  };

  const fetchUserRfps = async () => {
    try {
      const response = await fetch(`/api/marketplace/rfps?creator=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        setUserRfps(data);
      }
    } catch (error) {
      console.error('Failed to fetch user RFPs:', error);
    }
  };

  const fetchRfpBids = async (rfpId) => {
    try {
      const response = await fetch(`/api/marketplace/bids/${rfpId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBids(prev => ({ ...prev, [rfpId]: data }));
      }
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    }
  };

  const createRfp = async () => {
    try {
      const rfpData = {
        ...newRfp,
        budget: { ...newRfp.budget, amount: parseFloat(newRfp.budget.amount) },
        deadline: new Date(newRfp.deadline).toISOString()
      };

      const response = await fetch('/api/marketplace/rfp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(rfpData)
      });

      if (response.ok) {
        const data = await response.json();
        setUserRfps(prev => [data, ...prev]);
        setNewRfp({
          title: '',
          description: '',
          budget: { amount: '', currency: 'ETH' },
          deadline: '',
          required_skills: [],
          holder_only: false,
          milestones: []
        });
        setActiveTab('my-rfps');
      }
    } catch (error) {
      console.error('Failed to create RFP:', error);
    }
  };

  const submitBid = async (rfpId) => {
    try {
      const bidData = {
        rfp_id: rfpId,
        proposed_amount: { 
          ...newBid.proposed_amount, 
          amount: parseFloat(newBid.proposed_amount.amount) 
        },
        timeline: newBid.timeline,
        approach: newBid.approach,
        playground_demo_url: newBid.playground_demo_url || null
      };

      const response = await fetch('/api/marketplace/bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(bidData)
      });

      if (response.ok) {
        const data = await response.json();
        setNewBid({
          proposed_amount: { amount: '', currency: 'ETH' },
          timeline: '',
          approach: '',
          playground_demo_url: ''
        });
        setSelectedRfp(null);
        fetchRfps(); // Refresh to update bid counts
      }
    } catch (error) {
      console.error('Failed to submit bid:', error);
    }
  };

  const addSkill = (skill) => {
    if (skill && !newRfp.required_skills.includes(skill)) {
      setNewRfp(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skill]
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setNewRfp(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(skill => skill !== skillToRemove)
    }));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-black/40 border-cyan-500/30">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Connect Wallet</h2>
            <p className="text-gray-300">Please connect your wallet to access the RFP marketplace.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-cyan-400">📋 RFP Marketplace</h1>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setActiveTab('browse')}
              variant={activeTab === 'browse' ? 'default' : 'outline'}
              className={activeTab === 'browse' ? 'bg-cyan-600' : ''}
            >
              Browse RFPs
            </Button>
            <Button 
              onClick={() => setActiveTab('my-rfps')}
              variant={activeTab === 'my-rfps' ? 'default' : 'outline'}
              className={activeTab === 'my-rfps' ? 'bg-cyan-600' : ''}
            >
              My RFPs
            </Button>
            <Button 
              onClick={() => setActiveTab('create')}
              variant={activeTab === 'create' ? 'default' : 'outline'}
              className={activeTab === 'create' ? 'bg-green-600' : ''}
            >
              Create RFP
            </Button>
          </div>
        </div>

        {/* Browse RFPs Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            <Card className="bg-black/20 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">Available RFPs</CardTitle>
              </CardHeader>
              <CardContent>
                {rfps.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rfps.map((rfp) => (
                      <div key={rfp.id} className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-white text-lg">{rfp.title}</h3>
                          {rfp.holder_only && (
                            <Badge className="bg-purple-600 text-white">
                              🎯 HOLDER ONLY
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-400 mb-4 line-clamp-3">{rfp.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Budget:</span>
                            <span className="text-green-400 font-medium">
                              {rfp.budget.amount} {rfp.budget.currency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Deadline:</span>
                            <span className="text-white">
                              {new Date(rfp.deadline).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Bids:</span>
                            <span className="text-cyan-400">{rfp.bids_count}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {rfp.required_skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {rfp.required_skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{rfp.required_skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full bg-cyan-600 hover:bg-cyan-700"
                              onClick={() => setSelectedRfp(rfp)}
                              disabled={rfp.holder_only && !holderStatus?.isHolder}
                            >
                              {rfp.holder_only && !holderStatus?.isHolder ? 'Holder Only' : 'Submit Bid'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-black border-cyan-500/30 text-white max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-cyan-400">Submit Bid: {rfp.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Proposed Amount</Label>
                                  <div className="flex space-x-2">
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      value={newBid.proposed_amount.amount}
                                      onChange={(e) => setNewBid(prev => ({
                                        ...prev,
                                        proposed_amount: { ...prev.proposed_amount, amount: e.target.value }
                                      }))}
                                      className="bg-black/20 border-cyan-500/30"
                                    />
                                    <Select
                                      value={newBid.proposed_amount.currency}
                                      onValueChange={(value) => setNewBid(prev => ({
                                        ...prev,
                                        proposed_amount: { ...prev.proposed_amount, currency: value }
                                      }))}
                                    >
                                      <SelectTrigger className="w-20 bg-black/20 border-cyan-500/30">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-black border-cyan-500/30">
                                        <SelectItem value="ETH">ETH</SelectItem>
                                        <SelectItem value="SOL">SOL</SelectItem>
                                        <SelectItem value="XRP">XRP</SelectItem>
                                        <SelectItem value="HBAR">HBAR</SelectItem>
                                        <SelectItem value="DOGE">DOGE</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div>
                                  <Label>Timeline</Label>
                                  <Input
                                    placeholder="e.g., 2 weeks"
                                    value={newBid.timeline}
                                    onChange={(e) => setNewBid(prev => ({ ...prev, timeline: e.target.value }))}
                                    className="bg-black/20 border-cyan-500/30"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label>Approach & Strategy</Label>
                                <Textarea
                                  placeholder="Describe your approach to this project..."
                                  value={newBid.approach}
                                  onChange={(e) => setNewBid(prev => ({ ...prev, approach: e.target.value }))}
                                  rows={4}
                                  className="bg-black/20 border-cyan-500/30"
                                />
                              </div>
                              
                              <div>
                                <Label>Playground Demo URL (Optional)</Label>
                                <Input
                                  placeholder="https://your-demo-link.com"
                                  value={newBid.playground_demo_url}
                                  onChange={(e) => setNewBid(prev => ({ ...prev, playground_demo_url: e.target.value }))}
                                  className="bg-black/20 border-cyan-500/30"
                                />
                              </div>
                              
                              <div className="flex space-x-3">
                                <Button 
                                  onClick={() => submitBid(rfp.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Submit Bid
                                </Button>
                                <Button 
                                  onClick={() => setSelectedRfp(null)}
                                  variant="outline"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold mb-2">No RFPs Available</h3>
                    <p>Check back later for new opportunities!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* My RFPs Tab */}
        {activeTab === 'my-rfps' && (
          <div className="space-y-6">
            <Card className="bg-black/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400">My Posted RFPs</CardTitle>
              </CardHeader>
              <CardContent>
                {userRfps.length > 0 ? (
                  <div className="space-y-6">
                    {userRfps.map((rfp) => (
                      <div key={rfp.id} className="bg-gray-900/50 rounded-lg p-6 border border-green-500/30">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-white text-xl">{rfp.title}</h3>
                            <p className="text-gray-400 mt-2">{rfp.description}</p>
                          </div>
                          <Badge className={`${rfp.status === 'open' ? 'bg-green-600' : 'bg-gray-600'}`}>
                            {rfp.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-400">Budget:</span>
                            <div className="text-green-400 font-medium">
                              {rfp.budget.amount} {rfp.budget.currency}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Deadline:</span>
                            <div className="text-white">
                              {new Date(rfp.deadline).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Bids:</span>
                            <div className="text-cyan-400 font-medium">{rfp.bids_count}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Created:</span>
                            <div className="text-white">
                              {new Date(rfp.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        {rfp.bids_count > 0 && (
                          <Button 
                            onClick={() => fetchRfpBids(rfp.id)}
                            className="bg-cyan-600 hover:bg-cyan-700"
                          >
                            View {rfp.bids_count} Bid{rfp.bids_count !== 1 ? 's' : ''}
                          </Button>
                        )}
                        
                        {bids[rfp.id] && (
                          <div className="mt-4 space-y-3">
                            <h4 className="font-semibold text-cyan-400">Received Bids:</h4>
                            {bids[rfp.id].map((bid) => (
                              <div key={bid.id} className="bg-black/20 rounded-lg p-4 border border-cyan-500/30">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <span className="text-white font-medium">
                                      {bid.contractor_wallet.slice(0, 8)}...{bid.contractor_wallet.slice(-6)}
                                    </span>
                                    <Badge className="ml-2 bg-gray-600">{bid.status}</Badge>
                                  </div>
                                  <div className="text-green-400 font-medium">
                                    {bid.proposed_amount.amount} {bid.proposed_amount.currency}
                                  </div>
                                </div>
                                <p className="text-gray-300 mb-2">{bid.approach}</p>
                                <div className="text-sm text-gray-400">
                                  Timeline: {bid.timeline} • Submitted: {new Date(bid.submitted_at).toLocaleDateString()}
                                </div>
                                {bid.playground_demo_url && (
                                  <div className="mt-2">
                                    <a 
                                      href={bid.playground_demo_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-cyan-400 hover:text-cyan-300 text-sm"
                                    >
                                      🎮 View Demo
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold mb-2">No RFPs Created Yet</h3>
                    <p>Create your first RFP to find contractors!</p>
                    <Button 
                      onClick={() => setActiveTab('create')}
                      className="mt-4 bg-green-600 hover:bg-green-700"
                    >
                      Create RFP
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create RFP Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <Card className="bg-black/20 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">📝 Create New RFP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Project Title</Label>
                    <Input
                      placeholder="e.g., Build NFT Marketplace Frontend"
                      value={newRfp.title}
                      onChange={(e) => setNewRfp(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-black/20 border-cyan-500/30"
                    />
                  </div>
                  <div>
                    <Label>Deadline</Label>
                    <Input
                      type="date"
                      value={newRfp.deadline}
                      onChange={(e) => setNewRfp(prev => ({ ...prev, deadline: e.target.value }))}
                      className="bg-black/20 border-cyan-500/30"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Project Description</Label>
                  <Textarea
                    placeholder="Detailed description of your project requirements..."
                    value={newRfp.description}
                    onChange={(e) => setNewRfp(prev => ({ ...prev, description: e.target.value }))}
                    rows={6}
                    className="bg-black/20 border-cyan-500/30"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Budget</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newRfp.budget.amount}
                        onChange={(e) => setNewRfp(prev => ({
                          ...prev,
                          budget: { ...prev.budget, amount: e.target.value }
                        }))}
                        className="bg-black/20 border-cyan-500/30"
                      />
                      <Select
                        value={newRfp.budget.currency}
                        onValueChange={(value) => setNewRfp(prev => ({
                          ...prev,
                          budget: { ...prev.budget, currency: value }
                        }))}
                      >
                        <SelectTrigger className="w-24 bg-black/20 border-cyan-500/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-cyan-500/30">
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="SOL">SOL</SelectItem>
                          <SelectItem value="XRP">XRP</SelectItem>
                          <SelectItem value="HBAR">HBAR</SelectItem>
                          <SelectItem value="DOGE">DOGE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="holder-only"
                      checked={newRfp.holder_only}
                      onChange={(e) => setNewRfp(prev => ({ ...prev, holder_only: e.target.checked }))}
                      className="w-4 h-4"
                      disabled={!holderStatus?.isHolder}
                    />
                    <Label htmlFor="holder-only" className="flex items-center space-x-2">
                      <span>🎯 Holder Only RFP</span>
                      {!holderStatus?.isHolder && (
                        <Badge className="bg-gray-600 text-xs">Holder Required</Badge>
                      )}
                    </Label>
                  </div>
                </div>
                
                <div>
                  <Label>Required Skills</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {newRfp.required_skills.map((skill, index) => (
                      <Badge 
                        key={index}
                        className="bg-cyan-900/50 text-cyan-100 hover:bg-cyan-800 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add required skill..."
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
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    onClick={createRfp}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!newRfp.title || !newRfp.description || !newRfp.budget.amount}
                  >
                    Create RFP
                  </Button>
                  <Button 
                    onClick={() => setNewRfp({
                      title: '',
                      description: '',
                      budget: { amount: '', currency: 'ETH' },
                      deadline: '',
                      required_skills: [],
                      holder_only: false,
                      milestones: []
                    })}
                    variant="outline"
                  >
                    Clear Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}