import Phaser from 'phaser';
import { type Animal, type WorldState } from '../store/zooStore';

const TILE_SIZE = 32;
const BIOME_COLORS: Record<string, number> = {
  plains: 0x90EE90,    // Light green
  forest: 0x228B22,    // Forest green
  swamp: 0x556B2F,     // Dark olive
  ocean: 0x4169E1,     // Royal blue
  arctic: 0xE0FFFF,    // Light cyan
  desert: 0xF4A460,    // Sandy brown
  volcano: 0x8B0000,   // Dark red
  jungle: 0x006400,    // Dark green
  mountain: 0x808080,  // Gray
};

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

export class ZooScene extends Phaser.Scene {
  private animals: Animal[] = [];
  private world: WorldState | null = null;
  private animalSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private zoneGraphics: Phaser.GameObjects.Graphics | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key } | null = null;
  private onAnimalClick: ((animal: Animal) => void) | null = null;

  constructor() {
    super({ key: 'ZooScene' });
  }

  init(data: { onAnimalClick?: (animal: Animal) => void }) {
    this.onAnimalClick = data.onAnimalClick || null;
  }

  create() {
    // Set up camera
    this.cameras.main.setBackgroundColor(0x1a1a2e);
    
    // Create zone graphics layer
    this.zoneGraphics = this.add.graphics();
    
    // Set up keyboard controls
    this.cursors = this.input.keyboard?.createCursorKeys() || null;
    this.wasd = this.input.keyboard ? {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    } : null;

    // Mouse drag for camera
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
        this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
      }
    });

    // Mouse wheel zoom
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: any, _deltaX: number, deltaY: number) => {
      const zoom = this.cameras.main.zoom;
      const newZoom = Phaser.Math.Clamp(zoom - deltaY * 0.001, 0.5, 2);
      this.cameras.main.setZoom(newZoom);
    });
  }

  update() {
    const speed = 8;
    
    // Arrow keys
    if (this.cursors?.left.isDown || this.wasd?.A.isDown) {
      this.cameras.main.scrollX -= speed;
    }
    if (this.cursors?.right.isDown || this.wasd?.D.isDown) {
      this.cameras.main.scrollX += speed;
    }
    if (this.cursors?.up.isDown || this.wasd?.W.isDown) {
      this.cameras.main.scrollY -= speed;
    }
    if (this.cursors?.down.isDown || this.wasd?.S.isDown) {
      this.cameras.main.scrollY += speed;
    }

    // Animate animals (simple bobbing)
    this.animalSprites.forEach((container) => {
      const baseY = container.getData('baseY') as number;
      const offset = Math.sin(this.time.now / 500 + container.x) * 2;
      container.y = baseY + offset;
    });
  }

  setZooData(world: WorldState, animals: Animal[]) {
    this.world = world;
    this.animals = animals;
    this.renderZoo();
  }

  private renderZoo() {
    if (!this.world || !this.zoneGraphics) return;

    // Clear existing
    this.zoneGraphics.clear();
    this.animalSprites.forEach(sprite => sprite.destroy());
    this.animalSprites.clear();

    const worldPixelWidth = this.world.width * TILE_SIZE;
    const worldPixelHeight = this.world.height * TILE_SIZE;

    // Draw background grid
    this.zoneGraphics.fillStyle(0x1a1a2e);
    this.zoneGraphics.fillRect(0, 0, worldPixelWidth, worldPixelHeight);

    // Draw grid lines
    this.zoneGraphics.lineStyle(1, 0x333333, 0.3);
    for (let x = 0; x <= this.world.width; x++) {
      this.zoneGraphics.lineBetween(x * TILE_SIZE, 0, x * TILE_SIZE, worldPixelHeight);
    }
    for (let y = 0; y <= this.world.height; y++) {
      this.zoneGraphics.lineBetween(0, y * TILE_SIZE, worldPixelWidth, y * TILE_SIZE);
    }

    // Render each animal zone
    this.animals.forEach(animal => {
      this.renderAnimalZone(animal);
    });

    // Set camera bounds
    this.cameras.main.setBounds(0, 0, worldPixelWidth, worldPixelHeight);
    
    // Center camera on zoo
    this.cameras.main.centerOn(worldPixelWidth / 2, worldPixelHeight / 2);
    this.cameras.main.setZoom(1);
  }

  private renderAnimalZone(animal: Animal) {
    if (!this.zoneGraphics) return;

    const x = animal.homeX * TILE_SIZE;
    const y = animal.homeY * TILE_SIZE;
    const width = animal.homeWidth * TILE_SIZE;
    const height = animal.homeHeight * TILE_SIZE;

    // Get biome color
    const biomeColor = BIOME_COLORS[animal.biome] || 0x333333;
    const emoji = BIOME_EMOJIS[animal.biome] || '❓';

    // Draw zone background
    this.zoneGraphics.fillStyle(biomeColor, 0.6);
    this.zoneGraphics.fillRect(x + 2, y + 2, width - 4, height - 4);

    // Draw zone border
    this.zoneGraphics.lineStyle(2, biomeColor, 1);
    this.zoneGraphics.strokeRect(x + 2, y + 2, width - 4, height - 4);

    // Create animal container
    const container = this.add.container(x + width / 2, y + height / 2);
    container.setData('baseY', y + height / 2);
    container.setData('animal', animal);

    // Animal emoji (large)
    const animalEmoji = this.add.text(0, -10, emoji, {
      fontSize: '32px',
    }).setOrigin(0.5);

    // Ticker label
    const tickerLabel = this.add.text(0, 25, animal.ticker, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);

    // Market cap label
    const mcapText = this.formatMarketCap(animal.marketCap);
    const mcapLabel = this.add.text(0, 42, mcapText, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#00ff00',
    }).setOrigin(0.5);

    container.add([animalEmoji, tickerLabel, mcapLabel]);

    // Make interactive
    container.setSize(width - 8, height - 8);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      container.setScale(1.1);
    });

    container.on('pointerout', () => {
      container.setScale(1);
    });

    container.on('pointerdown', () => {
      if (this.onAnimalClick) {
        this.onAnimalClick(animal);
      }
    });

    this.animalSprites.set(animal.id, container);
  }

  private formatMarketCap(value: number): string {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value}`;
  }
}
