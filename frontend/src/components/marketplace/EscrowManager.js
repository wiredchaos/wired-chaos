import { useEffect, useState } from 'react';
import './EscrowManager.css';

// TODO: Implement Escrow Manager UI
// Features to implement:
// - Create and manage escrow contracts
// - Multi-signature wallet integration
// - Milestone-based payment release
// - Dispute resolution interface
// - Integration with WiredChaosEscrow.sol smart contract

const EscrowManager = ({ projectId }) => {
  const [escrows, setEscrows] = useState([]);
  const [activeEscrow, setActiveEscrow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadProjectEscrows(projectId);
    }
  }, [projectId]);

  const loadProjectEscrows = async (id) => {
    // TODO: Fetch escrow data from smart contract
    console.log('Loading escrows for project:', id);

    // Mock data for development
    setEscrows([
      {
        id: 'escrow_001',
        amount: '5.0 ETH',
        status: 'active',
        milestones: [
          { id: 1, description: 'Project Setup & Planning', amount: '1.0 ETH', status: 'completed' },
          { id: 2, description: 'Development Phase 1', amount: '2.0 ETH', status: 'in-progress' },
          { id: 3, description: 'Testing & Deployment', amount: '1.5 ETH', status: 'pending' },
          { id: 4, description: 'Final Delivery', amount: '0.5 ETH', status: 'pending' }
        ],
        contractor: '0x1234...5678',
        client: '0x8765...4321',
        createdAt: new Date('2025-10-01')
      }
    ]);

    setActiveEscrow(escrows[0]);
    setLoading(false);
  };

  const releaseMilestonePayment = async (milestoneId) => {
    // TODO: Call smart contract to release payment
    console.log('Releasing payment for milestone:', milestoneId);
  };

  const raiseDispute = async (escrowId, reason) => {
    // TODO: Initialize dispute resolution process
    console.log('Raising dispute for escrow:', escrowId, 'Reason:', reason);
  };

  if (loading) {
    return <div className="escrow-manager loading">🔒 Loading escrow data...</div>;
  }

  return (
    <div className="escrow-manager">
      <header className="escrow-header">
        <h3>🔒 Escrow Management</h3>
        <button className="create-escrow-btn">
          ➕ Create New Escrow
        </button>
      </header>

      {activeEscrow ? (
        <div className="active-escrow">
          <div className="escrow-summary">
            <div className="escrow-info">
              <h4>Escrow ID: {activeEscrow.id}</h4>
              <div className="amount">Total: {activeEscrow.amount}</div>
              <div className="status">Status: {activeEscrow.status}</div>
            </div>

            <div className="parties">
              <div className="party">
                <label>Client:</label>
                <span>{activeEscrow.client}</span>
              </div>
              <div className="party">
                <label>Contractor:</label>
                <span>{activeEscrow.contractor}</span>
              </div>
            </div>
          </div>

          <div className="milestones-section">
            <h4>📋 Project Milestones</h4>
            <div className="milestones-list">
              {activeEscrow.milestones.map((milestone) => (
                <div key={milestone.id} className={`milestone ${milestone.status}`}>
                  <div className="milestone-info">
                    <div className="milestone-title">
                      Milestone {milestone.id}: {milestone.description}
                    </div>
                    <div className="milestone-amount">{milestone.amount}</div>
                  </div>

                  <div className="milestone-actions">
                    {milestone.status === 'completed' && (
                      <span className="completed-badge">✅ Completed</span>
                    )}
                    {milestone.status === 'in-progress' && (
                      <button
                        className="release-payment-btn"
                        onClick={() => releaseMilestonePayment(milestone.id)}
                      >
                        💰 Release Payment
                      </button>
                    )}
                    {milestone.status === 'pending' && (
                      <span className="pending-badge">⏳ Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="escrow-actions">
            <button
              className="dispute-btn"
              onClick={() => raiseDispute(activeEscrow.id, 'Payment dispute')}
            >
              ⚠️ Raise Dispute
            </button>

            <button className="extend-escrow-btn">
              🔄 Extend Deadline
            </button>

            <button className="close-escrow-btn">
              ✅ Close Escrow
            </button>
          </div>
        </div>
      ) : (
        <div className="no-escrows">
          <p>No active escrows found for this project.</p>
          <button className="create-first-escrow-btn">
            🚀 Create Your First Escrow
          </button>
        </div>
      )}

      <div className="escrow-info-section">
        <h4>🛡️ How Escrow Works</h4>
        <ul>
          <li>💰 Funds are locked in a smart contract until milestones are met</li>
          <li>🤝 Both parties must agree before payments are released</li>
          <li>⚖️ Dispute resolution available through decentralized arbitration</li>
          <li>🔒 Multi-signature security for large transactions</li>
        </ul>
      </div>
    </div>
  );
};

export default EscrowManager;
