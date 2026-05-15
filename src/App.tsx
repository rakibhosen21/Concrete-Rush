import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TrendingUp, BarChart3, ShoppingBag } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { GameOverOverlay } from './components/GameOverOverlay';
import { PauseOverlay } from './components/PauseOverlay';
import { IntroLoader } from './components/IntroLoader';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Garage } from './components/Garage';
import { Logo } from './components/Logo';
import { AudioService } from './game/AudioService';

const GameContainer = lazy(() => import('./components/GameContainer').then(m => ({ default: m.GameContainer })));

export type GameState = 'INTRO' | 'HOME' | 'PLAYING' | 'GAME_OVER';

const INITIAL_STATS = {
  totalCoins: 0,
  bestScore: 0,
  bestDistance: 0,
  gamesPlayed: 0,
  unlockedSkins: ['NEURAL RUNNER'],
  equippedSkin: 'NEURAL RUNNER'
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('INTRO');
  const [score, setScore] = useState(0);
  const [cCollected, setCCollected] = useState(0);
  const [health, setHealth] = useState(3);
  const [multiplier, setMultiplier] = useState(1);
  const [gameOverData, setGameOverData] = useState<{ score: number; cCollected: number; distance: number; multiplier: number } | null>(null);
  const [showGarage, setShowGarage] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    // Lead stats from local storage
    const savedStats = localStorage.getItem('concrete_user_stats');
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    } else {
      setUserStats(INITIAL_STATS);
      localStorage.setItem('concrete_user_stats', JSON.stringify(INITIAL_STATS));
    }
    
    // Initial BGM
    AudioService.startMenuBGM();
  }, []);

  const saveStats = (newStats: any) => {
    setUserStats(newStats);
    localStorage.setItem('concrete_user_stats', JSON.stringify(newStats));
  };

  const handleGameOver = (data: { score: number; cCollected: number; distance: number; multiplier: number }) => {
    setScore(data.score);
    setCCollected(data.cCollected);
    setGameOverData(data);
    
    const newStats = {
      ...userStats,
      bestScore: Math.max(userStats.bestScore, data.score),
      bestDistance: Math.max(userStats.bestDistance, data.distance),
      totalCoins: userStats.totalCoins + data.cCollected,
      gamesPlayed: userStats.gamesPlayed + 1
    };
    saveStats(newStats);

    setGameState('GAME_OVER');
    AudioService.startMenuBGM(); // Transition back to menu music
  };

  const startGame = () => {
    setScore(0);
    setCCollected(0);
    setHealth(3);
    setMultiplier(1);
    setIsPaused(false);
    setGameState('PLAYING');
    AudioService.startGameBGM(); // Transition to game music
  };

  const handlePause = (paused: boolean) => {
    setIsPaused(paused);
  };

  const resumeGame = () => {
    setIsPaused(false);
    window.dispatchEvent(new CustomEvent('phaser-resume'));
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-svh bg-[#050208] text-white overflow-hidden select-none flex flex-col items-center justify-center relative">
        
        {/* FIXED BRANDING HEADER */}
        {!showGarage && (
          <div className="fixed top-0 left-0 right-0 z-[9999] p-4 sm:p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="flex items-center gap-4">
              <div className="pointer-events-auto">
                <Logo />
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-6 pointer-events-auto">
              {userStats && (
                 <button 
                  onClick={() => setShowGarage(true)}
                  className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/30 px-4 py-2 rounded-lg hover:bg-cyan-400/20 transition-all group"
                 >
                   <ShoppingBag size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Garage</span>
                 </button>
              )}
            </div>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-16 sm:top-20 left-0 right-0 z-[100] p-4 flex items-center justify-end pointer-events-none overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="bg-black/60 backdrop-blur-xl border border-white/5 px-3 py-1.5 rounded-full">
                <span className="text-[10px] font-mono text-cyan-400 tabular-nums">{userStats?.totalCoins || 0} $C</span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="relative z-10 w-full max-w-7xl flex items-center justify-center gap-4 sm:gap-8 lg:gap-12 px-4 sm:px-8">
          
          {gameState === 'HOME' && (
            <div className="hidden lg:flex flex-col gap-6 w-64 xl:w-72">
              <div className="bg-zinc-900 border border-white/5 p-5 xl:p-6 rounded-xl space-y-4">
                <button 
                  onClick={() => setShowGarage(true)}
                  className="w-full bg-black/40 hover:bg-cyan-400/10 hover:border-cyan-400/30 border border-white/5 p-4 rounded-lg flex items-center gap-4 transition-all group"
                >
                  <ShoppingBag size={18} className="text-cyan-400 opacity-40 group-hover:opacity-100" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Vehicle Garage</span>
                </button>
                <div className="pt-4 border-t border-white/5">
                  <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-2">High Score</div>
                  <div className="text-xl font-black italic text-yellow-400 tracking-tighter">{(userStats?.bestScore || 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Center Game Container */}
          <div className="relative flex-none">
            <Suspense fallback={<LoadingSpinner />}>
              <GameContainer 
                gameState={gameState}
                onScoreUpdate={setScore}
                onCCollectedUpdate={setCCollected}
                onHealthUpdate={setHealth}
                onMultiplierUpdate={setMultiplier}
                onGameOver={handleGameOver}
                onPauseUpdate={handlePause}
                userStats={userStats}
              />
            </Suspense>
          </div>

          {/* Right Panel - Realtime Data */}
          {gameState === 'PLAYING' && (
            <div className="hidden lg:flex flex-col gap-6 w-64 xl:w-72">
               <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-zinc-900 border border-white/5 p-5 xl:p-6 rounded-xl relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-400/5 blur-xl -z-10" />
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Core Integrity</div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    animate={{ width: `${(health / 3) * 100}%` }}
                    className={`h-full ${health < 2 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono opacity-40">
                  <span>SYNC_STABILITY</span>
                  <span>{Math.round((health/3)*100)}%</span>
                </div>
              </motion.div>

              <div className="bg-zinc-900 border border-yellow-400/20 p-5 xl:p-6 rounded-xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-brand-rotating opacity-10" />
                 <div className="absolute top-0 right-0 p-2 opacity-10">
                    <TrendingUp size={24} className="text-yellow-400" />
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-1">Multiplier</div>
                 <div className="text-3xl xl:text-4xl font-black italic tracking-tighter">X{multiplier.toFixed(2)}</div>
              </div>

              <div className="bg-zinc-900 border border-white/5 p-5 xl:p-6 rounded-xl">
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Tactical Data</div>
                 <div className="space-y-4">
                    <div>
                       <div className="text-[8px] text-zinc-600 mb-1 tracking-widest uppercase">Current_Yield</div>
                       <div className="text-2xl xl:text-3xl font-black italic tracking-tighter tabular-nums">{score.toLocaleString()}</div>
                    </div>
                    <div>
                       <div className="text-[8px] text-yellow-500 mb-1 tracking-widest uppercase">$C_COLLECTED</div>
                       <div className="text-2xl xl:text-3xl font-black italic tracking-tighter tabular-nums text-yellow-400">{cCollected}</div>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Overlay UI */}
        <AnimatePresence mode="wait">
          {gameState === 'INTRO' && (
            <IntroLoader key="intro" onComplete={() => setGameState('HOME')} />
          )}

          {gameState === 'HOME' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center"
            >
              <LandingPage onStart={startGame} onGarageOpen={() => setShowGarage(true)} userStats={userStats} />
            </motion.div>
          )}

          {gameState === 'GAME_OVER' && gameOverData && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
            >
              <GameOverOverlay 
                score={gameOverData.score} 
                cCollected={gameOverData.cCollected}
                distance={gameOverData.distance}
                multiplier={gameOverData.multiplier}
                onRestart={startGame} 
                onHome={() => {
                  setGameState('HOME');
                  AudioService.startMenuBGM();
                }} 
                userStats={userStats}
              />
            </motion.div>
          )}

          {isPaused && gameState === 'PLAYING' && (
             <PauseOverlay 
                onResume={resumeGame} 
                onHome={() => {
                  setGameState('HOME');
                  AudioService.startMenuBGM();
                }} 
             />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showGarage && userStats && (
            <Garage 
              onClose={() => setShowGarage(false)} 
              userStats={userStats} 
              onUpdateUser={saveStats} 
            />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
