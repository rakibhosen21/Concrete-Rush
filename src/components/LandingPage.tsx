import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Globe } from 'lucide-react';
import { AudioService } from '../game/AudioService';

interface LandingPageProps {
  onStart: () => void;
  onGarageOpen: () => void;
  userStats: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onGarageOpen, userStats }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(AudioService.getIsMenuMuted());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = AudioService.toggleLandingBGM();
    setIsMuted(muted);
  };

  const checkOrientationAndStart = () => {
    AudioService.playClick();
    startLoadingSequence();
  };

  const startLoadingSequence = () => {
    setIsLoading(true);
    setLoadingProgress(0);
    
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onStart, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);
  };

  useEffect(() => {
    // Sequence starts when function is called
  }, []);

  return (
    <div className="min-h-screen w-full bg-black text-white selection:bg-yellow-400 selection:text-black overflow-hidden relative flex flex-col pointer-events-none">
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(250, 204, 21, 0.2); }
          50% { box-shadow: 0 0 40px rgba(250, 204, 21, 0.4); }
        }
        @keyframes shimmer-scan {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        @keyframes border-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 100; }
        }
        @keyframes glitch-anim {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 1px); }
          40% { transform: translate(2px, -1px); }
          60% { transform: translate(-1px, -1px); }
          80% { transform: translate(1px, 2px); }
          100% { transform: translate(0); }
        }
        @keyframes shine-gold {
          0% { left: -100%; opacity: 0; }
          50% { opacity: 0.5; }
          100% { left: 100%; opacity: 0; }
        }
        .glow-pulse { animation: pulse-glow 3s infinite ease-in-out; }
        .shimmer-anim { animation: shimmer-scan 4s infinite linear; }
        .gold-sweep { animation: shine-gold 3s infinite linear; }
        .glitch-hover:hover .glitch-text { animation: glitch-anim 0.2s infinite; }
      `}</style>

      {/* Immersive Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/10 to-black pointer-events-none z-0" />
      
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: Math.random() * 0.3
            }}
            animate={{ 
              y: ["110%", "-10%"],
              opacity: [0, 0.3, 0]
            }}
            transition={{ 
              duration: 10 + Math.random() * 15, 
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
            className="absolute w-[2px] h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_white]"
          />
        ))}
      </div>
      
      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none z-0" />
 
      {/* Header */}
      <nav className="relative z-10 px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center max-w-7xl mx-auto w-full pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden sm:flex items-center gap-4 md:gap-8 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600"
        >
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-1 h-1 rounded-full bg-cyan-500/40" />
            <span className="group-hover:text-yellow-400 transition-colors tracking-widest uppercase">Node_Connected</span>
          </div>
        </motion.div>
      </nav>
 
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8"
        >
          <h1 className="text-5xl sm:text-8xl font-black italic tracking-tighter text-white mb-2 uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">CONCRETE RUSH</h1>
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.8em] text-cyan-400">NEURAL LINK ACTIVE</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-6 sm:gap-10 w-full relative"
        >
          <div className="relative pointer-events-auto z-10 flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
            {/* 1. INITIALIZE ENGINE */}
            <motion.button 
              onClick={checkOrientationAndStart}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="w-full skew-btn py-4 sm:py-6 bg-yellow-400 text-black font-black uppercase italic tracking-[0.3em] text-base sm:text-xl transition-all hover:bg-white hover:scale-105 active:scale-95 z-20 group relative overflow-hidden glow-pulse shadow-yellow-400/20"
            >
              <span className="relative z-10">INITIALIZE ENGINE</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full shimmer-anim -skew-x-12" />
            </motion.button>
            
            {/* 2. VEHICLE_GARAGE */}
            <button 
              onClick={() => {
                AudioService.playClick();
                onGarageOpen();
              }}
              className="w-full skew-btn py-4 sm:py-6 bg-cyan-500/10 text-cyan-400 border border-cyan-400/30 font-black uppercase italic tracking-[0.2em] text-sm sm:text-lg transition-all hover:bg-cyan-400 hover:text-black hover:scale-105 active:scale-95 z-20 group relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <rect width="100" height="100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="animate-[spin_10s_linear_infinite]" style={{ transformOrigin: 'center' }} />
                </svg>
              </div>
              <span className="relative z-10">VEHICLE_GARAGE</span>
            </button>

            {/* 3. EXPLORE CONCRETE */}
            <a 
              href="https://www.concrete.xyz/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => AudioService.playClick()}
              className="w-full skew-btn py-4 bg-black border border-cyan-400 text-cyan-400 font-black uppercase italic tracking-[0.2em] text-sm transition-all hover:bg-cyan-400/20 active:scale-95 text-center flex items-center justify-center gap-2 group relative overflow-hidden glitch-hover"
            >
              <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="relative z-10 glitch-text tracking-widest">EXPLORE CONCRETE</span>
            </a>

            {/* 4. DAILY CHECK-IN ✓ */}
            <a 
              href="https://points.concrete.xyz/home" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => AudioService.playClick()}
              className="w-full skew-btn py-4 bg-black border border-yellow-400/50 text-yellow-500 font-black uppercase italic tracking-[0.2em] text-sm transition-all hover:bg-yellow-400/20 active:scale-95 text-center flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/10 gold-sweep -skew-x-20" />
              <span className="relative z-10 flex items-center gap-2">
                DAILY CHECK-IN 
                <span className="group-hover:scale-125 group-hover:text-white transition-transform inline-block">✓</span>
              </span>
            </a>

            {/* Subtle BGM Toggle */}
            <button 
                onClick={toggleMute}
                className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors flex items-center gap-2 group px-4 py-2"
            >
                <span className="group-hover:animate-pulse">♪</span>
                <span className="tracking-widest">BGM {isMuted ? 'OFF' : 'ON'}</span>
                {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>

            <div className={`absolute -inset-4 bg-yellow-400/5 blur-2xl rounded-full -z-10 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`} />
          </div>
          
          {/* Social Links */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-8 pointer-events-auto">
            <a href="https://x.com/ConcreteXYZ" target="_blank" rel="noopener noreferrer" className="pointer-events-auto w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 hover:border-yellow-400/30 transition-all group">
              <svg className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://discord.gg/concretexyz" target="_blank" rel="noopener noreferrer" className="pointer-events-auto w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 hover:border-white transition-all group">
              <svg className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.46-.63.862-1.31 1.2-2.022a.076.076 0 0 0-.041-.105 13.11 13.11 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.293a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.101.246.199.37.293a.077.077 0 0 1-.006.127 12.29 12.29 0 0 1-1.873.892.077.077 0 0 0-.041.107c.34.71.742 1.39 1.2 2.02a.078.078 0 0 0 .084.028 19.83 19.83 0 0 0 6.002-3.03.085.085 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.18 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.18 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/></svg>
            </a>
          </div>
        </motion.div>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 pointer-events-auto"
          >
            <div className="w-full max-w-md space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Syncing_Neural_Link</div>
                  <div className="text-2xl font-black italic tracking-tighter text-white uppercase italic">SYSTEM_INITIALIZING</div>
                </div>
                <div className="text-3xl font-black italic text-cyan-400 font-mono">{Math.floor(loadingProgress)}%</div>
              </div>
              
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  className="h-full bg-cyan-400 shadow-[0_0_20px_#22d3ee] relative overflow-hidden"
                >
                    <motion.div 
                        className="absolute inset-0 bg-white/30"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                </motion.div>
              </div>

              <div className="flex justify-between items-center text-[8px] font-bold text-white/20 tracking-widest uppercase">
                <span>BUFFERING_ASSETS</span>
                <span className="flex gap-1">
                    <span className="w-1 h-1 bg-cyan-400/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1 h-1 bg-cyan-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1 h-1 bg-cyan-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Hint */}
      <div className="absolute bottom-4 sm:bottom-8 left-0 w-full px-4 sm:px-8 flex justify-between items-end pointer-events-none opacity-40">
        <div className="hidden lg:block text-[8px] font-mono tracking-[0.5em] uppercase vertical-text">SECURE_LAYER_STABLE</div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-white/30 items-center w-full sm:w-auto">
          <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-white/5 backdrop-blur-sm">
             <span className="px-1.5 py-0.5 border border-white/20 rounded-sm text-yellow-400">A / D</span>
             <span className="text-white/60">Steer Axis</span>
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-white/5 backdrop-blur-sm">
             <span className="px-1.5 py-0.5 border border-white/20 rounded-sm text-yellow-400">P</span>
             <span className="text-white/60">Pause Task</span>
          </div>
        </div>
        <div className="hidden lg:block text-[8px] font-mono tracking-[0.5em] uppercase vertical-text">TERMINAL_REF_094X</div>
      </div>
    </div>
  );
};
