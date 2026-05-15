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
  const [isMuted, setIsMuted] = useState(AudioService.getIsGameMuted());
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const muted = AudioService.toggleGameMute();
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
    <div className={`relative flex flex-col items-center justify-center bg-[#050208] overflow-hidden select-none w-full ${isLandscape ? 'h-full' : 'h-auto'} sm:h-auto`}>
      <div className={`w-full ${isLandscape ? 'aspect-video max-w-none' : 'aspect-[9/16] max-w-[500px]'} relative flex-shrink min-h-0 sm:rounded-2xl overflow-hidden shadow-[0_0_10px_rgba(0,0,0,1)] ring-1 ring-white/5`}>
        <div 
          id="game-container" 
          className="w-full h-full relative"
        />

        {/* Mute Button */}
        <button 
          onClick={toggleMute}
          className="absolute top-4 right-4 z-50 p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white/60 hover:text-yellow-400 transition-all active:scale-95 pointer-events-auto"
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

        {/* Overlay Controls in Landscape Mobile */}
        {gameState === 'PLAYING' && isLandscape && (
            <div className="absolute inset-0 pointer-events-none z-40 lg:hidden flex justify-between p-6 items-end">
                <div className="flex gap-4">
                    <button 
                        onPointerDown={(e) => {
                            (e.target as HTMLElement).setPointerCapture(e.pointerId);
                            moveCar(-1);
                        }}
                        className="w-20 h-20 bg-black/30 backdrop-blur-sm border-2 border-cyan-400/30 rounded-full flex items-center justify-center pointer-events-auto active:scale-95 active:bg-cyan-400/20"
                    >
                        <ChevronLeft size={40} className="text-cyan-400" />
                    </button>
                    <button 
                        onPointerDown={(e) => {
                            (e.target as HTMLElement).setPointerCapture(e.pointerId);
                            moveCar(1);
                        }}
                        className="w-20 h-20 bg-black/30 backdrop-blur-sm border-2 border-yellow-400/30 rounded-full flex items-center justify-center pointer-events-auto active:scale-95 active:bg-yellow-400/20"
                    >
                        <ChevronRight size={40} className="text-yellow-400" />
                    </button>
                </div>
                <button 
                    onPointerDown={(e) => {
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                        jump();
                    }}
                    className="w-20 h-20 bg-black/30 backdrop-blur-sm border-2 border-white/30 rounded-full flex items-center justify-center pointer-events-auto active:scale-95 active:bg-white/20"
                >
                    <div className="w-8 h-2 bg-white/60 rounded-full" />
                </button>
            </div>
        )}
      </div>

      {/* Mobile Controls - Portrait Mode Bottom Bar */}
      {gameState === 'PLAYING' && !isLandscape && (
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
