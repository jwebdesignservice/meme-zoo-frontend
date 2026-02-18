import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ZooScene } from './ZooScene';
import { useZooStore, Animal } from '../store/zooStore';

interface GameProps {
  onAnimalClick: (animal: Animal) => void;
}

export function Game({ onAnimalClick }: GameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { world, animals } = useZooStore();

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: '#1a1a2e',
      scene: ZooScene,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      input: {
        keyboard: true,
        mouse: true,
      },
    };

    gameRef.current = new Phaser.Game(config);

    // Start scene with callback
    gameRef.current.events.once('ready', () => {
      const scene = gameRef.current?.scene.getScene('ZooScene') as ZooScene;
      if (scene) {
        scene.scene.restart({ onAnimalClick });
      }
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onAnimalClick]);

  // Update zoo data when it changes
  useEffect(() => {
    if (!gameRef.current || !world || animals.length === 0) return;

    const scene = gameRef.current.scene.getScene('ZooScene') as ZooScene;
    if (scene && scene.scene.isActive()) {
      scene.setZooData(world, animals);
    }
  }, [world, animals]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }} 
    />
  );
}
