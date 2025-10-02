import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import './PuzzleInterface.css';

const PuzzleInterface = ({ walletAddress, currentLayer, credits, onSolve }) => {
  const [puzzles, setPuzzles] = useState([]);
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [solution, setSolution] = useState('');
  const [solving, setSolving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadPuzzles();
  }, [currentLayer]);

  const loadPuzzles = async () => {
    // Sample puzzles - in production would load from backend
    const samplePuzzles = [
      {
        id: '1',
        layer: 0,
        type: 'riddle',
        title: 'The Beginning',
        content: 'I am the start of every simulation, yet I exist only in reflection. What am I?',
        difficulty: 1,
        unlocked: true,
        solved: false
      },
      {
        id: '2',
        layer: 0,
        type: 'cipher',
        title: 'Hidden Message',
        content: 'Decode: 56 52 47 33 33 35 38 39',
        difficulty: 2,
        unlocked: true,
        solved: false
      },
      {
        id: '3',
        layer: 1,
        type: 'meta',
        title: 'Reality Check',
        content: 'Count the layers between truth and illusion',
        difficulty: 5,
        unlocked: false,
        solved: false
      }
    ];
    
    setPuzzles(samplePuzzles.filter(p => p.layer <= currentLayer));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!walletAddress) {
      setMessage({ type: 'error', text: 'Please connect your wallet' });
      return;
    }

    if (credits <= 0) {
      setMessage({ type: 'error', text: 'Insufficient credits' });
      return;
    }

    setSolving(true);
    setMessage(null);

    try {
      // Simulate solving attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check solution (simplified)
      const correct = solution.toLowerCase().trim() === 'loop' || 
                     solution.toLowerCase().trim() === 'vrg33589';
      
      if (correct) {
        setMessage({ type: 'success', text: 'Correct! Puzzle solved!' });
        onSolve(selectedPuzzle.id);
        
        // Update puzzle as solved
        setPuzzles(prev => prev.map(p => 
          p.id === selectedPuzzle.id ? { ...p, solved: true } : p
        ));
        
        setSolution('');
        setTimeout(() => setSelectedPuzzle(null), 2000);
      } else {
        setMessage({ type: 'error', text: 'Incorrect solution. Try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error submitting solution' });
    } finally {
      setSolving(false);
    }
  };

  const getPuzzleTypeIcon = (type) => {
    const icons = {
      riddle: '🧩',
      cipher: '🔐',
      meta: '🌀',
      collaborative: '👥'
    };
    return icons[type] || '❓';
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 3) return 'easy';
    if (difficulty <= 6) return 'medium';
    return 'hard';
  };

  return (
    <div className="puzzle-interface">
      {!selectedPuzzle ? (
        <div className="puzzle-list">
          <div className="puzzle-header">
            <h2>🎯 Active Puzzles</h2>
            <div className="puzzle-stats">
              <span>{puzzles.filter(p => p.solved).length}/{puzzles.length} Solved</span>
            </div>
          </div>
          
          <div className="puzzles-grid">
            {puzzles.map(puzzle => (
              <Card 
                key={puzzle.id}
                className={`puzzle-card ${puzzle.solved ? 'solved' : ''} ${!puzzle.unlocked ? 'locked' : ''}`}
                onClick={() => puzzle.unlocked && !puzzle.solved && setSelectedPuzzle(puzzle)}
              >
                <div className="puzzle-card-header">
                  <span className="puzzle-icon">{getPuzzleTypeIcon(puzzle.type)}</span>
                  <div className="puzzle-badges">
                    <Badge variant={getDifficultyColor(puzzle.difficulty)}>
                      Level {puzzle.difficulty}
                    </Badge>
                    {puzzle.solved && <Badge variant="success">✓ Solved</Badge>}
                    {!puzzle.unlocked && <Badge variant="locked">🔒 Locked</Badge>}
                  </div>
                </div>
                
                <h3>{puzzle.title}</h3>
                <p className="puzzle-preview">{puzzle.content}</p>
                
                <div className="puzzle-meta">
                  <span className="puzzle-type">{puzzle.type}</span>
                  <span className="puzzle-layer">Layer {puzzle.layer + 1}</span>
                </div>
                
                {puzzle.unlocked && !puzzle.solved && (
                  <Button className="solve-btn">Attempt Solution</Button>
                )}
              </Card>
            ))}
          </div>
          
          {puzzles.length === 0 && (
            <div className="no-puzzles">
              <p>No puzzles available at your current layer.</p>
              <p>Solve more puzzles to advance!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="puzzle-detail">
          <Button 
            onClick={() => setSelectedPuzzle(null)} 
            className="back-btn"
          >
            ← Back to Puzzles
          </Button>
          
          <Card className="puzzle-detail-card">
            <div className="puzzle-detail-header">
              <div className="puzzle-title-row">
                <span className="puzzle-icon-large">{getPuzzleTypeIcon(selectedPuzzle.type)}</span>
                <h2>{selectedPuzzle.title}</h2>
              </div>
              <div className="puzzle-badges">
                <Badge variant={getDifficultyColor(selectedPuzzle.difficulty)}>
                  Difficulty: {selectedPuzzle.difficulty}/10
                </Badge>
                <Badge variant="layer">Layer {selectedPuzzle.layer + 1}</Badge>
                <Badge variant="type">{selectedPuzzle.type}</Badge>
              </div>
            </div>
            
            <div className="puzzle-content">
              <div className="content-box">
                {selectedPuzzle.content}
              </div>
              
              {selectedPuzzle.type === 'cipher' && (
                <div className="hint-box">
                  💡 Hint: Look for patterns in the numbers
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="solution-form">
              <div className="form-group">
                <label>Your Solution:</label>
                <input
                  type="text"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Enter your answer..."
                  className="solution-input"
                  disabled={solving}
                />
              </div>
              
              <div className="form-footer">
                <div className="cost-info">
                  <span>Cost: 1 credit</span>
                  <span>Available: {credits} credits</span>
                </div>
                <Button 
                  type="submit" 
                  disabled={solving || !solution.trim() || credits <= 0}
                  className="submit-btn"
                >
                  {solving ? 'Submitting...' : 'Submit Solution'}
                </Button>
              </div>
            </form>
            
            {message && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default PuzzleInterface;
