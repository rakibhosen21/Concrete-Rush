import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TrendingUp, User, Trophy, BarChart3 } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { GameOverOverlay } from './components/GameOverOverlay';
import { IntroLoader } from './components/IntroLoader';
import { ProfileSetup } from './components/ProfileSetup';
import { LeaderboardOverlay } from './components/LeaderboardOverlay';
import { ProfileDossier } from './components/ProfileDossier';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';

const GameContainer = lazy(() => import('./components/GameContainer').then(m => ({ default: m.GameContainer })));

export type GameState = 'INTRO' | 'PROFILE_SETUP' | 'HOME' | 'PLAYING' | 'GAME_OVER';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('INTRO');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [multiplier, setMultiplier] = useState(1);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('concrete_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleProfileComplete = (newProfile: any) => {
    const fullProfile = {
      ...newProfile,
      firstVisit: false,
      totalYield: 0,
      gamesPlayed: 0
    };
    setProfile(fullProfile);
    localStorage.setItem('concrete_profile', JSON.stringify(fullProfile));
    setGameState('HOME');
  };

  const resetIdentity = () => {
    localStorage.clear();
    setProfile(null);
    setGameState('PROFILE_SETUP');
    setShowProfile(false);
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    
    // Update stats
    const stats = {
      highScore: parseInt(localStorage.getItem('concrete_high_score') || '0'),
      totalYield: parseInt(localStorage.getItem('concrete_total_yield') || '0'),
      gamesPlayed: parseInt(localStorage.getItem('concrete_games_played') || '0')
    };

    const newHighScore = Math.max(stats.highScore, finalScore);
    localStorage.setItem('concrete_high_score', newHighScore.toString());
    localStorage.setItem('concrete_total_yield', (stats.totalYield + finalScore).toString());
    localStorage.setItem('concrete_games_played', (stats.gamesPlayed + 1).toString());

    // Local Leaderboard
    const leaderboard = JSON.parse(localStorage.getItem('concrete_leaderboard') || '[]');
    const getGradeStr = (s: number) => {
        if (s >= 200) return 'S';
        if (s >= 101) return 'A';
        if (s >= 51) return 'B';
        if (s >= 21) return 'C';
        return 'D';
    };
    
    leaderboard.push({
        name: profile?.name || 'Unknown',
        avatar: profile?.avatar || '🤖',
        score: finalScore,
        grade: getGradeStr(finalScore),
        timestamp: Date.now()
    });
    localStorage.setItem('concrete_leaderboard', JSON.stringify(leaderboard));

    setGameState('GAME_OVER');
  };

  const startGame = () => {
    setScore(0);
    setHealth(3);
    setMultiplier(1);
    setGameState('PLAYING');
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-screen bg-[#050208] text-white overflow-hidden select-none flex flex-col items-center justify-center relative">
        
        {/* Background Decor */}
        <div className="absolute inset-0 z-0 opacity-10 bg-grid-cyber pointer-events-none" />

        {/* Screen Flash Border */}
        <motion.div 
          animate={{ opacity: multiplier > 1 ? [0, 0.4, 0] : 0 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute inset-0 z-40 border-[20px] border-yellow-400/30 pointer-events-none"
        />

        {/* Main Game Layout Container */}
        <div className="relative z-10 w-full flex items-center justify-center gap-12 px-8">
          
          {/* Left Panel - Profile & Navigation */}
          {gameState !== 'INTRO' && gameState !== 'PROFILE_SETUP' && (
            <div className="hidden lg:flex flex-col gap-6 w-72">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-zinc-900 shadow-[0_0_30px_rgba(250,204,21,0.05)] border border-yellow-400/20 p-6 rounded-xl relative overflow-hidden group cursor-pointer"
                onClick={() => setShowProfile(true)}
              >
                <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/5 transition-colors" />
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-4 flex justify-between items-center">
                  Operative_Status
                  <User size={12} className="opacity-40" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-3xl bg-black w-14 h-14 flex items-center justify-center rounded-xl border border-white/5">
                    {profile?.avatar || '🤖'}
                  </div>
                  <div>
                    <div className="text-sm font-black italic uppercase tracking-tighter text-white">{profile?.name || 'Establishing...'}</div>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                       <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">Linked</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl space-y-4">
                <button 
                  onClick={() => setShowLeaderboard(true)}
                  className="w-full bg-black/40 hover:bg-yellow-400/10 hover:border-yellow-400/30 border border-white/5 p-4 rounded-lg flex items-center gap-4 transition-all group"
                >
                  <Trophy size={18} className="text-yellow-400 opacity-40 group-hover:opacity-100" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">High Records</span>
                </button>
                <button 
                  onClick={() => setShowProfile(true)}
                  className="w-full bg-black/40 hover:bg-yellow-400/10 hover:border-yellow-400/30 border border-white/5 p-4 rounded-lg flex items-center gap-4 transition-all group"
                >
                  <BarChart3 size={18} className="text-yellow-400 opacity-40 group-hover:opacity-100" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Operative Stats</span>
                </button>
              </div>
            </div>
          )}

          {/* Center Game Container */}
          <div className="relative">
            <Suspense fallback={<LoadingSpinner />}>
              <GameContainer 
                gameState={gameState}
                onScoreUpdate={setScore}
                onHealthUpdate={setHealth}
                onMultiplierUpdate={setMultiplier}
                onGameOver={handleGameOver}
              />
            </Suspense>
          </div>

          {/* Right Panel - Realtime Data */}
          {gameState === 'PLAYING' && (
            <div className="hidden lg:flex flex-col gap-6 w-72">
               <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-zinc-900 border border-white/5 p-6 rounded-xl relative group overflow-hidden"
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

              <div className="bg-zinc-900 border border-yellow-400/20 p-6 rounded-xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-brand-rotating opacity-10" />
                 <div className="absolute top-0 right-0 p-2 opacity-10">
                    <TrendingUp size={24} className="text-yellow-400" />
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-1">Multiplier</div>
                 <div className="text-4xl font-black italic tracking-tighter">X{multiplier.toFixed(2)}</div>
              </div>

              <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl">
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Tactical Data</div>
                 <div className="space-y-4">
                    <div>
                       <div className="text-[8px] text-zinc-600 mb-1 tracking-widest uppercase">Current_Yield</div>
                       <div className="text-3xl font-black italic tracking-tighter tabular-nums">{score.toLocaleString()}</div>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Overlay UI */}
        <AnimatePresence mode="wait">
          {gameState === 'INTRO' && (
            <IntroLoader key="intro" onComplete={() => setGameState(profile ? 'HOME' : 'PROFILE_SETUP')} />
          )}

          {gameState === 'PROFILE_SETUP' && (
            <ProfileSetup key="setup" onComplete={handleProfileComplete} />
          )}

          {gameState === 'HOME' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center"
            >
              <LandingPage onStart={startGame} />
            </motion.div>
          )}

          {gameState === 'GAME_OVER' && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
            >
              <GameOverOverlay 
                score={score} 
                onRestart={startGame} 
                onHome={() => setGameState('HOME')} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLeaderboard && (
            <LeaderboardOverlay onClose={() => setShowLeaderboard(false)} />
          )}
          {showProfile && (
            <ProfileDossier onClose={() => setShowProfile(false)} onReset={resetIdentity} />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
