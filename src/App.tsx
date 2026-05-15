import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TrendingUp, User, BarChart3 } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { GameOverOverlay } from './components/GameOverOverlay';
import { PauseOverlay } from './components/PauseOverlay';
import { IntroLoader } from './components/IntroLoader';
import { ProfileSetup } from './components/ProfileSetup';
import { ProfileDossier } from './components/ProfileDossier';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AccountSetup } from './components/AccountSetup';
import { Logo } from './components/Logo';
import { SocialLinks } from './components/SocialLinks';

const GameContainer = lazy(() => import('./components/GameContainer').then(m => ({ default: m.GameContainer })));

export type GameState = 'ACCOUNT_SETUP' | 'INTRO' | 'PROFILE_SETUP' | 'HOME' | 'PLAYING' | 'GAME_OVER';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('INTRO');
  const [score, setScore] = useState(0);
  const [cCollected, setCCollected] = useState(0);
  const [health, setHealth] = useState(3);
  const [multiplier, setMultiplier] = useState(1);
  const [gameOverData, setGameOverData] = useState<{ score: number; cCollected: number; distance: number; multiplier: number } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    const agentId = localStorage.getItem('concrete_agent_id');
    if (agentId) {
      fetchUserStats(agentId);
    } else {
      setGameState('ACCOUNT_SETUP');
    }

    const savedProfile = localStorage.getItem('concrete_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const fetchUserStats = async (username: string) => {
    try {
      const res = await fetch(`/api/user/${username}`);
      if (res.ok) {
        const data = await res.json();
        setUserStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch user stats');
    }
  };

  const handleAccountComplete = (username: string) => {
    fetchUserStats(username);
    setGameState('INTRO');
  };

  const handleProfileComplete = (newProfile: any) => {
    const fullProfile = {
      ...newProfile,
      firstVisit: false,
      totalYield: 0,
      gamesPlayed: 0,
      bestDistance: 0,
      highScore: 0,
      lastPlayedTime: Date.now()
    };
    setProfile(fullProfile);
    localStorage.setItem('concrete_profile', JSON.stringify(fullProfile));
    setGameState('HOME');
  };

  const resetIdentity = () => {
    localStorage.clear();
    setProfile(null);
    setUserStats(null);
    setGameState('ACCOUNT_SETUP');
    setShowProfile(false);
  };

  const handleGameOver = async (data: { score: number; cCollected: number; distance: number; multiplier: number }) => {
    setScore(data.score);
    setCCollected(data.cCollected);
    setGameOverData(data);
    
    // Update stats on server
    const agentId = localStorage.getItem('concrete_agent_id');
    if (agentId) {
      try {
        const res = await fetch('/api/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: agentId,
            score: data.score,
            coinsCollected: data.cCollected,
            distance: Math.floor(data.distance)
          })
        });
        if (res.ok) {
          const updatedUser = await res.json();
          setUserStats(updatedUser.user);
        }
      } catch (err) {
        console.error('Failed to update stats');
      }
    }

    setGameState('GAME_OVER');
  };

  const startGame = () => {
    setScore(0);
    setCCollected(0);
    setHealth(3);
    setMultiplier(1);
    setIsPaused(false);
    setGameState('PLAYING');
  };

  const handlePause = (paused: boolean) => {
    setIsPaused(paused);
  };

  const resumeGame = () => {
    setIsPaused(false);
    // Directly tell the scene if needed, but the PauseOverlay button will call this
    // We can emit an event back to Phaser if needed
    window.dispatchEvent(new CustomEvent('phaser-resume'));
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-svh bg-[#050208] text-white overflow-hidden select-none flex flex-col items-center justify-center relative">
        
        {/* FIXED BRANDING HEADER - Always Visible */}
        <div className="fixed top-0 left-0 right-0 z-[9999] p-4 sm:p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="flex items-center gap-4">
            <div className="pointer-events-auto">
              <Logo />
            </div>
            {userStats && (
              <div className="hidden sm:flex flex-col pointer-events-auto">
                <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest leading-none mb-1">Agent_Connected</div>
                <div className="text-xs font-black italic text-cyan-400 uppercase tracking-widest">{userStats.username}</div>
              </div>
            )}
          </div>
          
          <div className="hidden sm:flex items-center gap-6 pointer-events-auto">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <span>Network_Stable</span>
            </div>
          </div>
        </div>

        {/* Top bar profile - Positioned below main header if needed or merged */}
        {gameState !== 'INTRO' && gameState !== 'PROFILE_SETUP' && profile && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-16 sm:top-20 left-0 right-0 z-[100] p-4 flex items-center justify-between pointer-events-none overflow-hidden"
          >
            {/* Scan Line Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
              <div className="h-full w-20 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan" />
            </div>
            
            <div 
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-xl border border-white/5 p-1 sm:p-1.5 pr-3 sm:pr-4 rounded-full cursor-pointer hover:bg-zinc-900 transition-all group pointer-events-auto shadow-2xl overflow-hidden max-w-[200px] sm:max-w-[300px]"
            >
              <div className="text-sm sm:text-lg bg-zinc-800 w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-white shrink-0 group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                {profile.avatar}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-tighter text-white leading-none mb-0.5 group-hover:text-yellow-400 transition-colors truncate">{profile.displayName || profile.name}</span>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
                  <span className="text-[6px] sm:text-[7px] font-mono text-zinc-500 uppercase tracking-widest leading-none truncate opacity-60 group-hover:opacity-100 transition-opacity">@{profile.username || profile.codename || 'AGENT'}</span>
                </div>
              </div>
            </div>

            {gameState === 'PLAYING' && (
              <div className="lg:hidden flex items-center gap-3">
                <div className="bg-black/60 backdrop-blur-xl border border-white/5 px-3 py-1.5 rounded-full">
                  <span className="text-[10px] font-mono text-yellow-400 tabular-nums">X{multiplier.toFixed(1)}</span>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/5 px-3 py-1.5 rounded-full">
                  <span className="text-[10px] font-mono text-white tabular-nums">{score.toLocaleString()}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Screen Flash Border */}
        <motion.div 
          animate={{ opacity: 0 }}
          className="absolute inset-0 z-40 border-[8px] sm:border-[20px] border-yellow-400/30 pointer-events-none"
        />

        {/* Main Game Layout Container */}
        <div className="relative z-10 w-full max-w-7xl flex items-center justify-center gap-4 sm:gap-8 lg:gap-12 px-4 sm:px-8">
          
          {/* Left Panel - Navigation */}
          {gameState !== 'INTRO' && gameState !== 'PROFILE_SETUP' && (
            <div className="hidden lg:flex flex-col gap-6 w-64 xl:w-72">
              <div className="bg-zinc-900 border border-white/5 p-5 xl:p-6 rounded-xl space-y-4">
                <button 
                  onClick={() => setShowProfile(true)}
                  className="w-full bg-black/40 hover:bg-yellow-400/10 hover:border-yellow-400/30 border border-white/5 p-4 rounded-lg flex items-center gap-4 transition-all group"
                >
                  <BarChart3 size={18} className="text-yellow-400 opacity-40 group-hover:opacity-100" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Dossier</span>
                </button>
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
          {gameState === 'ACCOUNT_SETUP' && (
            <AccountSetup onComplete={handleAccountComplete} />
          )}

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
                onHome={() => setGameState('HOME')} 
                userStats={userStats}
              />
            </motion.div>
          )}

          {isPaused && gameState === 'PLAYING' && (
             <PauseOverlay 
                onResume={resumeGame} 
                onHome={() => setGameState('HOME')} 
             />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showProfile && (
            <ProfileDossier onClose={() => setShowProfile(false)} onReset={resetIdentity} userStats={userStats} />
          )}
        </AnimatePresence>

        {/* FIXED SOCIAL FOOTER - Persistent on Home/Game Over etc. */}
        {gameState !== 'PLAYING' && (
          <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 pointer-events-none flex justify-center">
            <div className="pointer-events-auto">
              <SocialLinks />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
