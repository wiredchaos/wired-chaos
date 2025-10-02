import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { verifyHolderStatus } from '../lib/wallet-verification';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

export default function EscrowManager() {
  const { walletAddress, isConnected } = useWallet();
  const [holderStatus, setHolderStatus] = useState(null);
  const [escrows, setEscrows] = useState([]);
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      verifyHolderStatus(walletAddress).then(setHolderStatus);
      fetchEscrows();
    }
  }, [walletAddress]);

  const fetchEscrows = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/escrow/list?wallet=${walletAddress}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEscrows(data);
      }
    } catch (error) {
      console.error('Failed to fetch escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEscrow = async (escrowData) => {
    try {
      const response = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(escrowData)
      });

      if (response.ok) {
        const data = await response.json();
        setEscrows(prev => [data, ...prev]);
        return data;
      }
    } catch (error) {
      console.error('Failed to create escrow:', error);
      throw error;
    }
  };

  const releasePayment = async (escrowId, milestoneId = null) => {
    try {
      const response = await fetch(`/api/escrow/release/${escrowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ milestone_id: milestoneId })
      });

      if (response.ok) {
        fetchEscrows(); // Refresh escrow list
        return true;
      }
    } catch (error) {
      console.error('Failed to release payment:', error);
      throw error;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'created': return 'bg-blue-600';
      case 'funded': return 'bg-yellow-600';
      case 'in_progress': return 'bg-orange-600';
      case 'completed': return 'bg-green-600';
      case 'disputed': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const calculateProgress = (milestones) => {
    if (!milestones || milestones.length === 0) return 0;
    const completedMilestones = milestones.filter(m => m.status === 'approved').length;
    return (completedMilestones / milestones.length) * 100;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-black/40 border-cyan-500/30">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Connect Wallet</h2>
            <p className="text-gray-300">Please connect your wallet to access escrow management.</p>
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
          <h1 className="text-3xl font-bold text-cyan-400">🔒 Escrow Manager</h1>
          {holderStatus?.isHolder && (
            <Badge className="bg-purple-600 text-white">
              🎯 0% Platform Fees
            </Badge>
          )}
        </div>

        {/* Holder Benefits Alert */}
        {!holderStatus?.isHolder && (
          <Alert className="border-purple-500/30 bg-purple-900/20">
            <AlertDescription className="text-purple-200">
              💡 <strong>Vault Holders</strong> enjoy 0% platform fees on all escrow transactions. 
              Standard users pay 2.5% platform fee.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/20 border-cyan-500/30">
            <TabsTrigger value="active">Active Escrows</TabsTrigger>
            <TabsTrigger value="as-client">As Client</TabsTrigger>
            <TabsTrigger value="as-contractor">As Contractor</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {/* Active Escrows */}
          <TabsContent value="active" className="space-y-6">
            <Card className="bg-black/20 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">🚀 Active Escrows</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin text-4xl mb-4">⚡</div>
                    <p className="text-gray-400">Loading escrows...</p>
                  </div>
                ) : escrows.filter(e => ['funded', 'in_progress'].includes(e.status)).length > 0 ? (
                  <div className="space-y-6">
                    {escrows.filter(e => ['funded', 'in_progress'].includes(e.status)).map((escrow) => (
                      <div key={escrow.id} className="bg-gray-900/50 rounded-lg p-6 border border-cyan-500/30">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-white text-lg">
                              Escrow #{escrow.id.slice(0, 8)}...
                            </h3>
                            <p className="text-gray-400">RFP: {escrow.rfp_id}</p>
                          </div>
                          <Badge className={getStatusColor(escrow.status)}>
                            {escrow.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div>
                            <span className="text-sm text-gray-400">Total Amount:</span>
                            <div className="text-green-400 font-medium">
                              {escrow.amount.amount} {escrow.amount.currency}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Platform Fee:</span>
                            <div className="text-yellow-400 font-medium">
                              {(escrow.platform_fee * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Client:</span>
                            <div className="text-white font-mono text-sm">
                              {escrow.client_wallet.slice(0, 6)}...{escrow.client_wallet.slice(-4)}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Contractor:</span>
                            <div className="text-white font-mono text-sm">
                              {escrow.contractor_wallet.slice(0, 6)}...{escrow.contractor_wallet.slice(-4)}
                            </div>
                          </div>
                        </div>

                        {escrow.milestones && escrow.milestones.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-cyan-400">Project Milestones</h4>
                              <span className="text-sm text-gray-400">
                                {calculateProgress(escrow.milestones).toFixed(0)}% Complete
                              </span>
                            </div>
                            
                            <Progress value={calculateProgress(escrow.milestones)} className="h-2" />
                            
                            <div className="space-y-3">
                              {escrow.milestones.map((milestone, index) => (
                                <div key={milestone.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-gray-700">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-white font-medium">
                                        Milestone {index + 1}
                                      </span>
                                      <Badge className={
                                        milestone.status === 'approved' ? 'bg-green-600' :
                                        milestone.status === 'completed' ? 'bg-blue-600' :
                                        'bg-gray-600'
                                      }>
                                        {milestone.status.toUpperCase()}
                                      </Badge>
                                    </div>
                                    <p className="text-gray-400 text-sm mt-1">{milestone.description}</p>
                                    <div className="text-sm text-gray-500 mt-1">
                                      Due: {new Date(milestone.deadline).toLocaleDateString()} • 
                                      Value: {milestone.amount.amount} {milestone.amount.currency}
                                    </div>
                                  </div>
                                  
                                  {escrow.client_wallet === walletAddress && milestone.status === 'completed' && (
                                    <Button
                                      onClick={() => releasePayment(escrow.id, milestone.id)}
                                      className="bg-green-600 hover:bg-green-700 ml-4"
                                      size="sm"
                                    >
                                      Release Payment
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-6">
                          <span className="text-sm text-gray-400">
                            Created: {new Date(escrow.created_at).toLocaleDateString()}
                          </span>
                          
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => setSelectedEscrow(escrow)}
                              variant="outline"
                              size="sm"
                            >
                              View Details
                            </Button>
                            
                            {escrow.client_wallet === walletAddress && !escrow.milestones?.length && (
                              <Button
                                onClick={() => releasePayment(escrow.id)}
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                Release Full Payment
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-xl font-semibold mb-2">No Active Escrows</h3>
                    <p>Your active escrow contracts will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* As Client */}
          <TabsContent value="as-client" className="space-y-6">
            <Card className="bg-black/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400">💼 Escrows as Client</CardTitle>
              </CardHeader>
              <CardContent>
                {escrows.filter(e => e.client_wallet === walletAddress).length > 0 ? (
                  <div className="space-y-4">
                    {escrows.filter(e => e.client_wallet === walletAddress).map((escrow) => (
                      <div key={escrow.id} className="bg-gray-900/50 rounded-lg p-4 border border-green-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">
                              Escrow #{escrow.id.slice(0, 8)}...
                            </h3>
                            <p className="text-gray-400 text-sm">
                              Contractor: {escrow.contractor_wallet.slice(0, 8)}...{escrow.contractor_wallet.slice(-6)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-medium">
                              {escrow.amount.amount} {escrow.amount.currency}
                            </div>
                            <Badge className={getStatusColor(escrow.status)}>
                              {escrow.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>No escrows as client found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* As Contractor */}
          <TabsContent value="as-contractor" className="space-y-6">
            <Card className="bg-black/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400">🛠️ Escrows as Contractor</CardTitle>
              </CardHeader>
              <CardContent>
                {escrows.filter(e => e.contractor_wallet === walletAddress).length > 0 ? (
                  <div className="space-y-4">
                    {escrows.filter(e => e.contractor_wallet === walletAddress).map((escrow) => (
                      <div key={escrow.id} className="bg-gray-900/50 rounded-lg p-4 border border-blue-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">
                              Escrow #{escrow.id.slice(0, 8)}...
                            </h3>
                            <p className="text-gray-400 text-sm">
                              Client: {escrow.client_wallet.slice(0, 8)}...{escrow.client_wallet.slice(-6)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-medium">
                              {escrow.amount.amount} {escrow.amount.currency}
                            </div>
                            <Badge className={getStatusColor(escrow.status)}>
                              {escrow.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>No escrows as contractor found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed */}
          <TabsContent value="completed" className="space-y-6">
            <Card className="bg-black/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400">✅ Completed Escrows</CardTitle>
              </CardHeader>
              <CardContent>
                {escrows.filter(e => e.status === 'completed').length > 0 ? (
                  <div className="space-y-4">
                    {escrows.filter(e => e.status === 'completed').map((escrow) => (
                      <div key={escrow.id} className="bg-gray-900/50 rounded-lg p-4 border border-purple-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">
                              Escrow #{escrow.id.slice(0, 8)}...
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {escrow.client_wallet === walletAddress ? 'Contractor' : 'Client'}: {
                                escrow.client_wallet === walletAddress 
                                  ? `${escrow.contractor_wallet.slice(0, 8)}...${escrow.contractor_wallet.slice(-6)}`
                                  : `${escrow.client_wallet.slice(0, 8)}...${escrow.client_wallet.slice(-6)}`
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-medium">
                              {escrow.amount.amount} {escrow.amount.currency}
                            </div>
                            <div className="text-sm text-gray-400">
                              Completed: {escrow.completed_at && new Date(escrow.completed_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>No completed escrows found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Escrow Details Modal */}
        {selectedEscrow && (
          <Dialog open={!!selectedEscrow} onOpenChange={() => setSelectedEscrow(null)}>
            <DialogContent className="bg-black border-cyan-500/30 text-white max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-cyan-400">
                  Escrow Details #{selectedEscrow.id.slice(0, 8)}...
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3">Contract Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <Badge className={getStatusColor(selectedEscrow.status)}>
                          {selectedEscrow.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Amount:</span>
                        <span className="text-green-400 font-medium">
                          {selectedEscrow.amount.amount} {selectedEscrow.amount.currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Platform Fee:</span>
                        <span className="text-yellow-400">
                          {(selectedEscrow.platform_fee * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white">
                          {new Date(selectedEscrow.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-3">Parties</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Client:</span>
                        <div className="text-white font-mono">
                          {selectedEscrow.client_wallet}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Contractor:</span>
                        <div className="text-white font-mono">
                          {selectedEscrow.contractor_wallet}
                        </div>
                      </div>
                      {selectedEscrow.contract_address && (
                        <div>
                          <span className="text-gray-400">Contract Address:</span>
                          <div className="text-cyan-400 font-mono text-xs">
                            {selectedEscrow.contract_address}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedEscrow.milestones && selectedEscrow.milestones.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Milestones Progress</h3>
                    <div className="space-y-3">
                      {selectedEscrow.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="p-3 bg-gray-900/50 rounded border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">
                              Milestone {index + 1}
                            </span>
                            <Badge className={
                              milestone.status === 'approved' ? 'bg-green-600' :
                              milestone.status === 'completed' ? 'bg-blue-600' :
                              'bg-gray-600'
                            }>
                              {milestone.status}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{milestone.description}</p>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Due: {new Date(milestone.deadline).toLocaleDateString()}</span>
                            <span>{milestone.amount.amount} {milestone.amount.currency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}