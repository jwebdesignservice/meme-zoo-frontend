import { useEffect, useCallback } from 'react';
import { Game } from './game/Game';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { useZooStore } from './store/zooStore';
import type { Animal } from './store/zooStore';
import './App.css';

function App() {
  const { 
    selectedAnimal, 
    selectAnimal, 
    fetchZooState,
    error 
  } = useZooStore();

  // Fetch zoo state on mount and every 5 minutes
  useEffect(() => {
    fetchZooState();
    
    const interval = setInterval(() => {
      fetchZooState();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchZooState]);

  const handleAnimalClick = useCallback((animal: Animal) => {
    selectAnimal(animal);
  }, [selectAnimal]);

  const handleCloseCard = useCallback(() => {
    selectAnimal(null);
  }, [selectAnimal]);

  return (
    <div className="app">
      <Header />
      
      <main className="zoo-container">
        <Game onAnimalClick={handleAnimalClick} />
        
        {error && (
          <div className="error-banner">
            ⚠️ {error} — Make sure backend is running on localhost:3001
          </div>
        )}
        
        <div className="controls-hint">
          <span>🖱️ Drag to pan</span>
          <span>⌨️ WASD / Arrows to move</span>
          <span>🔍 Scroll to zoom</span>
          <span>👆 Click animal for stats</span>
        </div>
      </main>

      {selectedAnimal && (
        <StatCard 
          animal={selectedAnimal} 
          onClose={handleCloseCard} 
        />
      )}
    </div>
  );
}

export default App;
