/**
 * Vault UI - Burn Tracker Component
 * Tracks burn progress and fragment unlocks
 */
import React from 'react';

const BurnTracker = ({ 
  fragments = [],
  totalFragments = 5,
  burnCount = 0,
  className = ''
}) => {
  const fragmentNames = [
    'Mask of the West',
    'Ember Sangréal', 
    'Third Column Chalice',
    'Five Burnings Aligned',
    'Sangréal Loop 33·3'
  ];

  return (
    <div className={`vault-holo-card accent-red ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🔥</span>
        <div>
          <h3 className="vault-red-core text-xl font-bold">
            Burn Tracker
          </h3>
          <p className="text-sm opacity-80">{burnCount} tokens burned</p>
        </div>
      </div>
      
      {/* Fragment Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">Merovingian Fragments</span>
          <span className="text-sm">{fragments.length}/{totalFragments}</span>
        </div>
        
        <div className="vault-fragment-counter mb-3">
          {Array.from({ length: totalFragments }, (_, i) => (
            <div 
              key={i}
              className={`vault-fragment-dot ${fragments.includes(i + 1) ? 'unlocked' : ''}`}
              title={fragmentNames[i] || `Fragment ${i + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Fragment List */}
      <div className="space-y-2">
        {fragmentNames.map((name, i) => {
          const isUnlocked = fragments.includes(i + 1);
          return (
            <div 
              key={i}
              className={`flex items-center gap-2 text-sm p-2 rounded ${
                isUnlocked ? 'bg-purple-900/20 text-purple-300' : 'opacity-50'
              }`}
            >
              <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${
                isUnlocked ? 
                  'border-purple-400 bg-purple-900/30 text-purple-300' : 
                  'border-gray-600 text-gray-500'
              }`}>
                {isUnlocked ? '✓' : i + 1}
              </span>
              <span className={isUnlocked ? 'font-medium' : ''}>
                {isUnlocked ? name : '???'}
              </span>
            </div>
          );
        })}
      </div>
      
      {fragments.length === totalFragments && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/30 to-red-900/30 rounded-lg border border-purple-500/30">
          <div className="text-center">
            <span className="text-lg">👑</span>
            <div className="vault-purple-glow font-bold">SANGRÉAL KEY UNLOCKED</div>
            <div className="text-xs opacity-80 mt-1">The Merovingian path is complete</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BurnTracker;