import { type Animal } from '../store/zooStore';
import './StatCard.css';

interface StatCardProps {
  animal: Animal;
  onClose: () => void;
}

const BIOME_EMOJIS: Record<string, string> = {
  plains: '🐕',
  forest: '🐱',
  swamp: '🐸',
  ocean: '🐋',
  arctic: '🐧',
  desert: '🦂',
  volcano: '🐉',
  jungle: '🦁',
  mountain: '🐐',
};

const CHAIN_COLORS: Record<string, string> = {
  ethereum: '#627EEA',
  solana: '#14F195',
  bsc: '#F0B90B',
  base: '#0052FF',
  arbitrum: '#28A0F0',
};

function formatMarketCap(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value}`;
}

function formatNumber(value: number): string {
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function StatCard({ animal, onClose }: StatCardProps) {
  const emoji = BIOME_EMOJIS[animal.biome] || '❓';
  const chainColor = CHAIN_COLORS[animal.chain] || '#888';

  return (
    <div className="stat-card-overlay" onClick={onClose}>
      <div className="stat-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="card-header">
          <span className="animal-emoji">{emoji}</span>
          <div className="header-info">
            <h2>{animal.name}</h2>
            <span className="ticker">${animal.ticker}</span>
          </div>
        </div>

        <div className="chain-badge" style={{ backgroundColor: chainColor }}>
          {animal.chain}
        </div>

        <div className="stats-grid">
          <div className="stat">
            <span className="stat-label">Market Cap</span>
            <span className="stat-value mcap">{formatMarketCap(animal.marketCap)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">24h Volume</span>
            <span className="stat-value">{formatMarketCap(animal.volume24h)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Liquidity</span>
            <span className="stat-value">{formatMarketCap(animal.liquidity)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Holders</span>
            <span className="stat-value">{formatNumber(animal.holders)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Biome</span>
            <span className="stat-value biome">{animal.biome}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Spawned</span>
            <span className="stat-value">{timeAgo(animal.spawnTime)}</span>
          </div>
        </div>

        <div className="links">
          {animal.links.dex && (
            <a href={animal.links.dex} target="_blank" rel="noopener noreferrer" className="link-btn dex">
              📊 Chart
            </a>
          )}
          {animal.links.twitter && (
            <a href={animal.links.twitter} target="_blank" rel="noopener noreferrer" className="link-btn twitter">
              🐦 Twitter
            </a>
          )}
          {animal.links.website && (
            <a href={animal.links.website} target="_blank" rel="noopener noreferrer" className="link-btn website">
              🌐 Website
            </a>
          )}
        </div>

        {animal.links.dex && (
          <div className="chart-embed">
            <iframe 
              src={`${animal.links.dex}?embed=1&theme=dark`}
              title={`${animal.ticker} Chart`}
              frameBorder="0"
            />
          </div>
        )}
      </div>
    </div>
  );
}
