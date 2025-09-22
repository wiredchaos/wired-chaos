/**
 * WIRED CHAOS - Motherboard Panel Chip Component
 * Glowing panel chip embedded into motherboard surface
 */
import React, { useState, useEffect } from 'react';

const PanelChip = ({ 
  icon = '🔲',
  title,
  description,
  variant = 'cyan', // cyan, red, green, pink
  href,
  onClick,
  className = '',
  loading = false,
  status = 'active', // active, inactive, error
  children
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [pulses, setPulses] = useState([]);

  // Generate energy pulses on hover
  useEffect(() => {
    if (isHovered) {
      const pulse = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100
      };
      setPulses(prev => [...prev, pulse]);
      
      // Remove pulse after animation
      setTimeout(() => {
        setPulses(prev => prev.filter(p => p.id !== pulse.id));
      }, 2000);
    }
  }, [isHovered]);

  const variantClasses = {
    cyan: '',
    red: 'chip-red',
    green: 'chip-green', 
    pink: 'chip-pink'
  };

  const statusIcons = {
    active: '🟢',
    inactive: '🟡',
    error: '🔴'
  };

  const ChipContent = () => (
    <div 
      className={`panel-chip ${variantClasses[variant]} ${loading ? 'panel-loading' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Energy Pulses */}
      {pulses.map(pulse => (
        <div
          key={pulse.id}
          className="energy-pulse"
          style={{
            left: `${pulse.x}%`,
            top: `${pulse.y}%`
          }}
        />
      ))}
      
      {/* Chip Header */}
      <div className="chip-label">
        <span className="chip-icon">{icon}</span>
        <div className="flex-1">
          <div className="chip-title">{title}</div>
          {description && (
            <div className="chip-description">{description}</div>
          )}
        </div>
        {status !== 'active' && (
          <span className="text-xs">{statusIcons[status]}</span>
        )}
      </div>
      
      {/* Chip Content */}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
      
      {/* Circuit Connection Points */}
      <div className="absolute -left-1 top-1/2 w-2 h-2 bg-cyan-400 rounded-full opacity-30"></div>
      <div className="absolute -right-1 top-1/2 w-2 h-2 bg-cyan-400 rounded-full opacity-30"></div>
      <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full opacity-30"></div>
      <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-cyan-400 rounded-full opacity-30"></div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        <ChipContent />
      </a>
    );
  }

  return <ChipContent />;
};

export default PanelChip;