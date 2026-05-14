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
  onGameOver: (data: { score: number; distance: number; multiplier: number }) => void;
  gameState: 'INTRO' | 'PROFILE_SETUP' | 'HOME' | 'PLAYING' | 'GAME_OVER';
}

export const GameContainer: React.FC<GameContainerProps> = ({
  onScoreUpdate,
  onHealthUpdate,
  onMultiplierUpdate,
  onGameOver,
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

  return (
    <div className="relative flex flex-col items-center justify-center bg-[#050208] overflow-hidden select-none w-[95vw] sm:w-[85vw] md:w-[70vw] lg:w-[50vw] xl:w-[40vw] max-h-[85vh] lg:max-h-[80vh]">
      <div className="w-full aspect-[2/3] relative flex-shrink min-h-0">
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
      </div>

      {/* Mobile Controls - Positioned below the game container on mobile */}
      {gameState === 'PLAYING' && (
        <div className="lg:hidden w-full h-[80px] shrink-0 pointer-events-none flex z-30 mt-4">
           <button 
             onPointerDown={(e) => {
               (e.target as HTMLElement).setPointerCapture(e.pointerId);
               moveCar(-1);
               if (navigator.vibrate) navigator.vibrate(30);
             }}
             className="flex-1 pointer-events-auto h-full bg-[#0a0a1a]/85 border-r border-t-2 border-r-cyan-400/20 border-t-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)] active:bg-cyan-400 active:border-t-white transition-all flex flex-col items-center justify-center group"
           >
             <span className="text-cyan-400 font-black text-2xl group-active:text-black leading-none uppercase tracking-tighter">◄◄</span>
             <span className="text-cyan-400/60 font-mono text-[10px] group-active:text-black uppercase tracking-widest mt-1">Left</span>
           </button>
           <button 
             onPointerDown={(e) => {
               (e.target as HTMLElement).setPointerCapture(e.pointerId);
               moveCar(1);
               if (navigator.vibrate) navigator.vibrate(30);
             }}
             className="flex-1 pointer-events-auto h-full bg-[#0a0a1a]/85 border-l border-t-2 border-l-yellow-400/20 border-t-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)] active:bg-yellow-400 active:border-t-white transition-all flex flex-col items-center justify-center group"
           >
             <span className="text-yellow-400 font-black text-2xl group-active:text-black leading-none uppercase tracking-tighter">►►</span>
             <span className="text-yellow-400/60 font-mono text-[10px] group-active:text-black uppercase tracking-widest mt-1">Right</span>
           </button>
        </div>
      )}
    </div>
  );
};
