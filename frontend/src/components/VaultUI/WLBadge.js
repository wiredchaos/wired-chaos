/**
 * Vault UI - Whitelist Badge Component
 * Shows WL status with visual progression
 */
import React from 'react';

const WLBadge = ({ 
  points = 0, 
  tier = 'Seeker',
  progress = 0,
  maxProgress = 100,
  className = ''
}) => {
  const tierColors = {
    'Seeker': 'vault-cyan-outline',
    'Holder': 'vault-purple-glow', 
    'Pathfinder': 'vault-red-core',
    'Merovingian': 'vault-neon-title'
  };

  const tierIcons = {
    'Seeker': '🔍',
    'Holder': '🏷️',
    'Pathfinder': '🗝️',
    'Merovingian': '👑'
  };

  return (
    <div className={`vault-holo-card accent-purple ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{tierIcons[tier]}</span>
          <div>
            <h3 className={`${tierColors[tier]} text-xl font-bold`}>
              {tier}
            </h3>
            <p className="text-sm opacity-80">{points} WL Points</p>
          </div>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress to Next Tier</span>
          <span>{progress}/{maxProgress}</span>
        </div>
        <div className="vault-progress">
          <div 
            className="vault-progress-fill"
            style={{ width: `${(progress / maxProgress) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="text-xs opacity-70 text-center">
        {tier === 'Merovingian' ? 
          '🕯️ The path is complete...' : 
          `Continue your journey to unlock ${tier === 'Seeker' ? 'Holder' : tier === 'Holder' ? 'Pathfinder' : 'Merovingian'} status`
        }
      </div>
    </div>
  );
};

export default WLBadge;