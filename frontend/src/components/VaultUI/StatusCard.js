/**
 * Vault UI - Status Card Component
 * Reusable status display with neon styling
 */
import React from 'react';

const StatusCard = ({ 
  title, 
  value, 
  status = 'pending',
  description,
  accent = 'cyan',
  icon,
  onClick,
  className = ''
}) => {
  const statusClasses = {
    active: 'status-active',
    pending: 'status-pending', 
    warning: 'status-warning',
    error: 'status-error'
  };

  const accentClasses = {
    cyan: '',
    red: 'accent-red',
    purple: 'accent-purple'
  };

  return (
    <div 
      className={`vault-holo-card ${accentClasses[accent]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="vault-neon-title vault-cyan-outline text-lg font-semibold">
            {title}
          </h3>
        </div>
        <span className={`vault-status-badge ${statusClasses[status]}`}>
          {status.toUpperCase()}
        </span>
      </div>
      
      <div className="mb-2">
        <div className="vault-stat-value text-2xl">
          {value}
        </div>
      </div>
      
      {description && (
        <p className="text-sm opacity-80 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default StatusCard;