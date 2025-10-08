/**
 * WIRED CHAOS - 3D Brain Assistant Component
 * Hyper-realistic brain on legs with AI-powered interactions
 */
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Html, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import './BrainAssistant3D.css';

const applyLinearColorSpace = target => {
  if (!target) return;
  if ('colorSpace' in target && THREE.LinearSRGBColorSpace) {
    target.colorSpace = THREE.LinearSRGBColorSpace;
  }
};

// Brain Geometry Component - Procedurally generated brain
const BrainGeometry = ({ position, isWalking, currentMessage }) => {
  const meshRef = useRef();
  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Pulsing brain animation
      const scale = 1 + Math.sin(time * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
      
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.2;
      
      // Walking rotation
      if (isWalking) {
        meshRef.current.rotation.y += delta * 0.5;
      }
      
      setTime(time + delta);
    }
  });

  // Create brain-like geometry using displacement
  const brainGeometry = React.useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.8, 64, 64);
    const vertices = geometry.attributes.position.array;
    
    // Add brain-like bumps and valleys
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
      
      // Create brain wrinkles using noise
      const noise = Math.sin(x * 8) * Math.cos(y * 8) * Math.sin(z * 8) * 0.1;
      const distance = Math.sqrt(x * x + y * y + z * z);
      const factor = 1 + noise;
      
      vertices[i] = x * factor;
      vertices[i + 1] = y * factor;
      vertices[i + 2] = z * factor;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  // Brain material with realistic appearance
  const brainMaterial = React.useMemo(() => {
    const mat = new THREE.MeshPhongMaterial({
      color: '#ff6b9d',
      shininess: 30,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    if (mat.map) {
      applyLinearColorSpace(mat.map);
    }
    return mat;
  }, []);

  return (
    <group position={position}>
      {/* Main Brain */}
      <mesh ref={meshRef} geometry={brainGeometry} material={brainMaterial}>
        {/* Brain stem */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.2, 0.3, 0.8, 16]} />
          <meshPhongMaterial color="#ff8a9b" />
        </mesh>
        
        {/* Neural connections (glowing lines) */}
        <NeuralConnections />
      </mesh>
      
      {/* Speech bubble for AI messages */}
      {currentMessage && (
        <Html position={[0, 1.5, 0]} center>
          <div className="brain-speech-bubble">
            <p>{currentMessage}</p>
          </div>
        </Html>
      )}
    </group>
  );
};

// Neural connections component
const NeuralConnections = () => {
  const connectionsRef = useRef();
  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    setTime(time + delta);
    
    if (connectionsRef.current) {
      // Animate neural connections
      connectionsRef.current.children.forEach((line, i) => {
        const intensity = (Math.sin(time * 3 + i) + 1) * 0.5;
        line.material.opacity = intensity * 0.8;
      });
    }
  });

  // Generate random neural connections
  const connections = React.useMemo(() => {
    const lines = [];
    for (let i = 0; i < 20; i++) {
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 1.6
      );
      const end = new THREE.Vector3(
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 1.6
      );
      
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      lines.push(geometry);
    }
    return lines;
  }, []);

  return (
    <group ref={connectionsRef}>
      {connections.map((geometry, i) => (
        <line key={i} geometry={geometry}>
          <lineBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.6}
          />
        </line>
      ))}
    </group>
  );
};

// Legs Component - Realistic walking legs
const Legs = ({ position, isWalking }) => {
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const [walkCycle, setWalkCycle] = useState(0);

  useFrame((state, delta) => {
    if (isWalking) {
      setWalkCycle(walkCycle + delta * 8);
      
      // Animate legs walking
      if (leftLegRef.current && rightLegRef.current) {
        const leftAngle = Math.sin(walkCycle) * 0.5;
        const rightAngle = Math.sin(walkCycle + Math.PI) * 0.5;
        
        leftLegRef.current.rotation.x = leftAngle;
        rightLegRef.current.rotation.x = rightAngle;
        
        // Add slight up-down motion
        leftLegRef.current.position.y = -0.2 + Math.abs(Math.sin(walkCycle)) * 0.1;
        rightLegRef.current.position.y = -0.2 + Math.abs(Math.sin(walkCycle + Math.PI)) * 0.1;
      }
    }
  });

  return (
    <group position={[position[0], position[1] - 1.2, position[2]]}>
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.3, 0, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
          <meshPhongMaterial color="#ff9bb5" />
        </mesh>
        
        {/* Shin */}
        <mesh position={[0, -1.2, 0]}>
          <capsuleGeometry args={[0.12, 0.8, 8, 16]} />
          <meshPhongMaterial color="#ff9bb5" />
        </mesh>
        
        {/* Foot */}
        <mesh position={[0, -1.8, 0.2]}>
          <boxGeometry args={[0.2, 0.1, 0.5]} />
          <meshPhongMaterial color="#ffaac7" />
        </mesh>
      </group>
      
      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.3, 0, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
          <meshPhongMaterial color="#ff9bb5" />
        </mesh>
        
        {/* Shin */}
        <mesh position={[0, -1.2, 0]}>
          <capsuleGeometry args={[0.12, 0.8, 8, 16]} />
          <meshPhongMaterial color="#ff9bb5" />
        </mesh>
        
        {/* Foot */}
        <mesh position={[0, -1.8, 0.2]}>
          <boxGeometry args={[0.2, 0.1, 0.5]} />
          <meshPhongMaterial color="#ffaac7" />
        </mesh>
      </group>
    </group>
  );
};

// Ground plane for the brain to walk on
const Ground = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshPhongMaterial 
        color="#0a0a0a" 
        transparent 
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Main 3D Brain Assistant Component
const BrainAssistant3D = ({ 
  isOpen, 
  onClose, 
  onAskQuestion,
  currentMessage = "Hello! I'm your WIRED CHAOS guide. Ask me anything about our ecosystem!",
  isWalking = false
}) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const handleAskQuestion = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    const question = userInput;
    setUserInput('');
    
    // Add user message to history
    setConversationHistory(prev => [...prev, { role: 'user', content: question }]);
    
    try {
      if (onAskQuestion) {
        const response = await onAskQuestion(question);
        setConversationHistory(prev => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      console.error('Error asking question:', error);
      setConversationHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting right now. Please try again!" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="brain-assistant-modal">
      <div className="brain-assistant-container">
        {/* Close button */}
        <button className="brain-close-btn" onClick={onClose}>
          ✕
        </button>
        
        {/* 3D Canvas */}
        <div className="brain-canvas-container">
          <Canvas
            camera={{ position: [0, 0, 8], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
          >
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff6b9d" />
            <spotLight 
              position={[0, 10, 0]} 
              angle={Math.PI / 6} 
              intensity={1} 
              color="#ffffff"
              castShadow
            />
            
            {/* 3D Brain with Legs */}
            <BrainGeometry 
              position={[0, 0, 0]} 
              isWalking={isWalking}
              currentMessage={currentMessage}
            />
            <Legs 
              position={[0, 0, 0]} 
              isWalking={isWalking}
            />
            
            {/* Ground */}
            <Ground />
            
            {/* Controls */}
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxDistance={15}
              minDistance={3}
            />
          </Canvas>
        </div>
        
        {/* Chat Interface */}
        <div className="brain-chat-interface">
          <div className="brain-chat-header">
            <h3>🧠 WIRED CHAOS Brain Assistant</h3>
            <p>Ask me about our ecosystem, get guided tours, or chat about Web3!</p>
          </div>
          
          {/* Conversation History */}
          <div className="brain-conversation">
            {conversationHistory.slice(-4).map((msg, index) => (
              <div key={index} className={`brain-message ${msg.role}`}>
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="brain-message assistant">
                <div className="message-content">
                  <div className="brain-thinking">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="brain-input-area">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about WIRED CHAOS..."
              className="brain-input"
              rows={2}
              disabled={isLoading}
            />
            <button 
              onClick={handleAskQuestion}
              className="brain-send-btn"
              disabled={isLoading || !userInput.trim()}
            >
              {isLoading ? '🧠' : '💬'}
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="brain-quick-actions">
            <button 
              onClick={() => setUserInput("Tell me about the WIRED CHAOS ecosystem")}
              className="brain-quick-btn"
            >
              🌐 Ecosystem Tour
            </button>
            <button 
              onClick={() => setUserInput("How does NEURO LAB work?")}
              className="brain-quick-btn"
            >
              🧠 NEURO LAB
            </button>
            <button 
              onClick={() => setUserInput("What is Vault33?")}
              className="brain-quick-btn"
            >
              🔐 Vault33
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainAssistant3D;