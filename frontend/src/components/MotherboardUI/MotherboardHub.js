/**
 * WIRED CHAOS - Motherboard Hub Component
 * Main navigation hub with panel chips embedded in motherboard surface
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PanelChip from './PanelChip';
import featureFlags from '../../config/featureFlags';

const MotherboardHub = () => {
  const navigate = useNavigate();
  const [energyNodes, setEnergyNodes] = useState([]);
  const [connectionActive, setConnectionActive] = useState(null);

  // Generate energy nodes on mount
  useEffect(() => {
    const nodes = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }));
    setEnergyNodes(nodes);
  }, []);

  const panelChips = [
    {
      icon: '🧠',
      title: 'NEURO LAB',
      description: 'Onboarding Academy Hub',
      variant: 'cyan',
      path: '/neuro',
      status: 'active'
    },
    {
      icon: '🚀',
      title: 'CSN',
      description: 'Crypto Spaces Network',
      variant: 'green',
      path: '/csn',
      status: 'active'
    },
    {
      icon: '📻',
      title: '33.3 FM',
      description: 'DOGECHAIN Radio',
      variant: 'red',
      path: '/fm333',
      status: 'active'
    },
    {
      icon: '📰',
      title: 'BWB',
      description: 'Barbed Wired Broadcast',
      variant: 'cyan',
      path: '/bwb',
      status: 'active'
    },
    {
      icon: '🔐',
      title: 'VAULT 33',
      description: 'WL Gamification System',
      variant: 'red',
      path: '/vault33',
      status: 'active'
    },
    {
      icon: '👁️',
      title: 'VRG33589',
      description: 'Merovingian Tinfoil Bot',
      variant: 'pink',
      path: '/vrg33589',
      status: 'active'
    },
    {
      icon: '🛍️',
      title: 'MERCH HUB',
      description: 'Wired Chaos Storefront',
      variant: 'pink',
      path: '/merch',
      status: 'active'
    },
    {
      icon: '🎭',
      title: 'TAKEOVER',
      description: 'Event Control Center',
      variant: 'red',
      path: '/takeover',
      status: 'inactive'
    },
    {
      icon: '🎓',
      title: 'WC UNIVERSITY',
      description: 'Educational Seal Chips',
      variant: 'cyan',
      path: '/university',
      status: 'active'
    },
    {
      icon: '🐕',
      title: 'DOGINAL DOGS HQ',
      description: 'Pixel Dog Chip Node',
      variant: 'green',
      path: '/doginal-dogs',
      status: 'active'
    },
    {
      icon: '⚡',
      title: 'WLFI',
      description: 'DeFi Financial Chip',
      variant: 'cyan',
      path: '/wlfi',
      status: 'inactive'
    },
    {
      icon: '🌀',
      title: '589 THEORY',
      description: 'Cryptographic Circuit Node',
      variant: 'pink',
      path: '/589-theory',
      status: 'active'
    }
  ];

  const handleChipClick = (path, index) => {
    // Animate connection
    setConnectionActive(index);
    
    // Navigate after animation
    setTimeout(() => {
      navigate(path);
      setConnectionActive(null);
    }, 800);
  };

  return (
    <div className={`relative min-h-screen ${featureFlags.enableUniversalGrid ? 'motherboard-container' : ''}`}>
      {/* Motherboard Universe Background */}
      <div className="motherboard-universe">
        {/* Energy Nodes */}
        {energyNodes.map(node => (
          <div
            key={node.id}
            className="energy-node"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              animationDelay: `${node.delay}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-16 text-center">
          <h1 className="motherboard-title text-6xl md:text-8xl mb-4">
            WIRED CHAOS
          </h1>
          <p className="text-lg md:text-xl opacity-80 font-mono tracking-wider">
            UNIVERSAL MOTHERBOARD OS
          </p>
          <div className="flex justify-center items-center gap-4 mt-4">
            <span className="text-green-400">●</span>
            <span className="text-xs font-mono opacity-60">
              SYSTEM ONLINE • ALL PANELS OPERATIONAL
            </span>
            <span className="text-green-400">●</span>
          </div>
        </header>

        {/* Panel Grid */}
        <div className="motherboard-grid flex-1">
          {panelChips.map((chip, index) => (
            <PanelChip
              key={chip.title}
              icon={chip.icon}
              title={chip.title}
              description={chip.description}
              variant={chip.variant}
              status={chip.status}
              className={connectionActive === index ? 'connection-active' : ''}
              onClick={() => handleChipClick(chip.path, index)}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="py-8 text-center">
          <div className="text-xs font-mono opacity-40">
            <p>LIVING COMPUTER INTERFACE • PLACEHOLDER PANELS UNTIL 3D IMPORTS</p>
            <p>CLICK PANEL → ANIMATE GLOWING PATHWAYS → SYSTEM ACCESS</p>
          </div>
        </footer>
      </div>

      {/* Circuit Connections (for animations) */}
      {connectionActive !== null && (
        <div className="fixed inset-0 pointer-events-none z-5">
          <div className="circuit-connection active absolute top-1/2 left-0 w-full h-1 transform -translate-y-1/2" />
          <div className="circuit-connection active absolute top-0 left-1/2 w-1 h-full transform -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};

export default MotherboardHub;