import { useZooStore } from '../store/zooStore';
import './Header.css';

export function Header() {
  const { world, animals, lastUpdated, isLoading } = useZooStore();

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <header className="zoo-header">
      <div className="header-left">
        <h1>🦁 Meme Zoo</h1>
        <span className="subtitle">Top Animal Meme Coins</span>
      </div>
      
      <div className="header-stats">
        {world && (
          <>
            <div className="header-stat">
              <span className="stat-num">{animals.length}</span>
              <span className="stat-label">Animals</span>
            </div>
            <div className="header-stat">
              <span className="stat-num">{world.maxAnimals - world.currentCount}</span>
              <span className="stat-label">Slots Left</span>
            </div>
            <div className="header-stat">
              <span className="stat-num">{world.width}×{world.height}</span>
              <span className="stat-label">World</span>
            </div>
          </>
        )}
      </div>

      <div className="header-right">
        <span className={`status ${isLoading ? 'loading' : 'ok'}`}>
          {isLoading ? '⏳ Loading...' : '✅ Live'}
        </span>
        <span className="last-updated">
          Updated: {formatTime(lastUpdated)}
        </span>
      </div>
    </header>
  );
}
