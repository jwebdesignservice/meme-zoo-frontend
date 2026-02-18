import { create } from 'zustand';

export interface Animal {
  id: string;
  name: string;
  ticker: string;
  chain: string;
  biome: string;
  homeX: number;
  homeY: number;
  homeWidth: number;
  homeHeight: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  holders: number;
  logoUrl: string | null;
  spawnTime: number;
  links: {
    dex: string | null;
    website: string | null;
    twitter: string | null;
  };
}

export interface WorldState {
  width: number;
  height: number;
  zoneSize: number;
  maxAnimals: number;
  currentCount: number;
  isFull: boolean;
}

interface ZooState {
  world: WorldState | null;
  animals: Animal[];
  selectedAnimal: Animal | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  
  setWorld: (world: WorldState) => void;
  setAnimals: (animals: Animal[]) => void;
  selectAnimal: (animal: Animal | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchZooState: () => Promise<void>;
}

const API_URL = 'http://localhost:3001';

export const useZooStore = create<ZooState>((set, get) => ({
  world: null,
  animals: [],
  selectedAnimal: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  
  setWorld: (world) => set({ world }),
  setAnimals: (animals) => set({ animals }),
  selectAnimal: (animal) => set({ selectedAnimal: animal }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  fetchZooState: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/zoo-state`);
      if (!response.ok) throw new Error('Failed to fetch zoo state');
      
      const data = await response.json();
      set({
        world: data.world,
        animals: data.animals,
        lastUpdated: data.timestamp,
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  }
}));

// Fetch random phrase
export async function fetchPhrase(category?: string): Promise<string> {
  try {
    const url = category 
      ? `${API_URL}/phrase?category=${category}`
      : `${API_URL}/phrase`;
    const response = await fetch(url);
    const data = await response.json();
    return data.phrase;
  } catch {
    return 'gm fren';
  }
}
