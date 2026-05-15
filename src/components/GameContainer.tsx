import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { GameConfig } from '../game/GameConfig';
import MainScene from '../game/MainScene';
import MenuScene from '../game/MenuScene';
import { AudioService } from '../game/AudioService';

interface GameContainerProps {
  onScoreUpdate: (score: number) => void;
  onCCollectedUpdate: (c: number) => void;
  onHealthUpdate: (health: number) => void;
  onMultiplierUpdate: (multiplier: number) => void;
  onGameOver: (data: { score: number; cCollected: number; distance: number; multiplier: number }) => void;
  onPauseUpdate: (paused: boolean) => void;
  gameState: 'INTRO' | 'PROFILE_SETUP' | 'HOME' | 'PLAYING' | 'GAME_OVER';
  userStats: any;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  onScoreUpdate,
  onCCollectedUpdate,
  onHealthUpdate,
  onMultiplierUpdate,
  onGameOver,
  onPauseUpdate,
  gameState,
  userStats,
}) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (gameRef.current) {
        gameRef.current.registry.set('userStats', userStats);
    }
  }, [userStats]);

  useEffect(() => {
    if (!gameRef.current) {
      const config = {
        ...GameConfig,
        scene: [MenuScene, MainScene],
      };
      const game = new Phaser.Game(config);
      gameRef.current = game;
      game.registry.set('userStats', userStats);

      game.events.on('update-score', onScoreUpdate);
      game.events.on('update-c-collected', onCCollectedUpdate);
      game.events.on('update-health', onHealthUpdate);
      game.events.on('update-multiplier', onMultiplierUpdate);
      game.events.on('game-over', onGameOver);
      game.events.on('game-paused', onPauseUpdate);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handlePhaserResume = () => {
        if (gameRef.current && gameState === 'PLAYING') {
            const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
            if (scene) {
                // Since togglePause is private, we can emit an event or make a helper
                gameRef.current.events.emit('resume-game');
            }
        }
    };

    window.addEventListener('phaser-resume', handlePhaserResume);

    if (gameRef.current) {
        if (gameState === 'PLAYING') {
          gameRef.current.scene.stop('MenuScene');
          gameRef.current.scene.start('MainScene');
        } else if (gameState === 'HOME' || gameState === 'INTRO') {
          gameRef.current.scene.stop('MainScene');
          gameRef.current.scene.start('MenuScene');
        }
    }

    return () => window.removeEventListener('phaser-resume', handlePhaserResume);
  }, [gameState]);

  const toggleMute = () => {
    const muted = AudioService.toggleMute();
    setIsMuted(muted);
  };

   const moveCar = (dir: -1 | 1) => {
    if (gameRef.current && gameState === 'PLAYING') {
       gameRef.current.events.emit('move-car', dir);
    }
  };

  const jump = () => {
    if (gameRef.current && gameState === 'PLAYING') {
        const scene = gameRef.current.scene.getScene('MainScene') as any;
        if (scene) {
            scene.jump();
        }
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center bg-[#050208] overflow-hidden select-none w-full max-w-[500px] h-full sm:h-auto">
      <div className="w-full aspect-[9/16] relative flex-shrink min-h-0 sm:rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.1)]">
        <div 
          id="game-container" 
          className="w-full h-full relative"
        />

        {/* Mute Button */}
        <button 
          onClick={toggleMute}
          className="absolute top-4 right-4 z-20 p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white/60 hover:text-yellow-400 transition-all active:scale-95"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Pause Trigger - Mobile tap top center */}
        <div 
          onClick={() => {
              if (gameRef.current && gameState === 'PLAYING') {
                  const scene = gameRef.current.scene.getScene('MainScene') as any;
                  if (scene) scene.togglePause();
              }
          }}
          className="absolute top-0 left-1/4 right-1/4 h-12 z-10 cursor-pointer lg:hidden"
        />
      </div>

      {/* Mobile Controls - Positioned below the game container on mobile */}
      {gameState === 'PLAYING' && (
        <div className="lg:hidden w-full h-[100px] shrink-0 pointer-events-none flex gap-2 z-30 mt-4 px-2">
           <button 
             onPointerDown={(e) => {
               (e.target as HTMLElement).setPointerCapture(e.pointerId);
               moveCar(-1);
               if (navigator.vibrate) navigator.vibrate(20);
             }}
             className="flex-1 pointer-events-auto h-full bg-[#0a0a1a]/85 border-2 border-cyan-400/30 rounded-xl active:bg-cyan-400/20 active:border-cyan-400 transition-all flex flex-col items-center justify-center group"
           >
             <ChevronLeft size={32} className="text-cyan-400" />
             <span className="text-cyan-400/60 font-mono text-[10px] uppercase tracking-widest mt-1">Left</span>
           </button>

           <button 
             onPointerDown={(e) => {
               (e.target as HTMLElement).setPointerCapture(e.pointerId);
               jump();
               if (navigator.vibrate) navigator.vibrate(40);
             }}
             className="flex-1 pointer-events-auto h-full bg-zinc-900/80 border-2 border-white/10 rounded-xl active:bg-white/10 active:border-white transition-all flex flex-col items-center justify-center group"
           >
             <div className="w-10 h-1.5 bg-white/20 rounded-full mb-2" />
             <span className="text-white/60 font-mono text-[10px] uppercase tracking-widest leading-none">Jump</span>
           </button>

           <button 
             onPointerDown={(e) => {
               (e.target as HTMLElement).setPointerCapture(e.pointerId);
               moveCar(1);
               if (navigator.vibrate) navigator.vibrate(20);
             }}
             className="flex-1 pointer-events-auto h-full bg-[#0a0a1a]/85 border-2 border-yellow-400/30 rounded-xl active:bg-yellow-400/20 active:border-yellow-400 transition-all flex flex-col items-center justify-center group"
           >
             <ChevronRight size={32} className="text-yellow-400" />
             <span className="text-yellow-400/60 font-mono text-[10px] uppercase tracking-widest mt-1">Right</span>
           </button>
        </div>
      )}
    </div>
  );
};
