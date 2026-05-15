import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { GameConfig } from '../game/GameConfig';
import MainScene from '../game/MainScene';
import MenuScene from '../game/MenuScene';
import { AudioService } from '../game/AudioService';

interface GameContainerProps {
  onScoreUpdate: (score: number) => void;
  onHealthUpdate: (health: number) => void;
  onMultiplierUpdate: (multiplier: number) => void;
  onGameOver: (finalScore: number) => void;
  onCCollectedUpdate?: (collected: number) => void;
  onPauseUpdate?: (paused: boolean) => void;
  gameState: 'INTRO' | 'HOME' | 'PLAYING' | 'GAME_OVER';
}

export const GameContainer: React.FC<GameContainerProps> = ({
  onScoreUpdate,
  onHealthUpdate,
  onMultiplierUpdate,
  onGameOver,
  onCCollectedUpdate,
  onPauseUpdate,
  gameState,
}) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!gameRef.current) {
      const config = {
        ...GameConfig,
        scene: [MenuScene, MainScene],
      };
      const game = new Phaser.Game(config);
      gameRef.current = game;

      game.events.on('update-score', onScoreUpdate);
      game.events.on('update-health', onHealthUpdate);
      game.events.on('update-multiplier', onMultiplierUpdate);
      game.events.on('game-over', onGameOver);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gameRef.current) {
      if (gameState === 'PLAYING') {
        gameRef.current.scene.stop('MenuScene');
        gameRef.current.scene.start('MainScene');
      } else if (gameState === 'HOME' || gameState === 'INTRO') {
        gameRef.current.scene.stop('MainScene');
        gameRef.current.scene.start('MenuScene');
      }
    }
  }, [gameState]);

  const toggleMute = () => {
    const muted = AudioService.toggleMute();
    setIsMuted(muted);
  };

  const moveCar = (dir: -1 | 1) => {
    if (gameRef.current && gameState === 'PLAYING') {
       const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
       if (scene) {
          // Calling the private moveLane would require it to be public or triggered by event
          gameRef.current.events.emit('move-car', dir);
       }
    }
  };

  const width = Math.floor(window.innerWidth * 0.65);
  const height = Math.floor(window.innerHeight * 0.75);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050208] overflow-hidden select-none">
      <div className="relative" style={{ width, height }}>
        <div 
          id="game-container" 
          className="w-full h-full relative shadow-[0_0_50px_rgba(0,240,255,0.3)] border-2 border-[#00f0ff]/30 rounded-lg overflow-hidden"
        />

        {/* Mute Button */}
        <button 
          onClick={toggleMute}
          className="absolute top-4 right-4 z-20 p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white/60 hover:text-yellow-400 transition-all active:scale-95"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Mobile Controls Overlay */}
        {gameState === 'PLAYING' && (
          <div className="md:hidden absolute inset-0 pointer-events-none flex flex-col justify-end p-6 z-10">
             <div className="flex justify-between w-full pointer-events-auto">
                <button 
                  onPointerDown={() => moveCar(-1)}
                  className="w-20 h-20 bg-cyan-400/10 backdrop-blur-md border border-cyan-400/40 rounded-full flex items-center justify-center text-cyan-400 active:bg-cyan-400 active:text-black transition-all"
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  onPointerDown={() => moveCar(1)}
                   className="w-20 h-20 bg-cyan-400/10 backdrop-blur-md border border-cyan-400/40 rounded-full flex items-center justify-center text-cyan-400 active:bg-cyan-400 active:text-black transition-all"
                >
                  <ChevronRight size={32} />
                </button>
             </div>
          </div>
        )}
      </div>
      
      {/* Background Decorative Elements for the side areas */}
      <div className="absolute top-0 left-0 w-[17.5%] h-full bg-gradient-to-r from-black to-transparent opacity-50" />
      <div className="absolute top-0 right-0 w-[17.5%] h-full bg-gradient-to-l from-black to-transparent opacity-50" />
    </div>
  );
};
