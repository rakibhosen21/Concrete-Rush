import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Globe, Rocket } from 'lucide-react';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';
import { AudioService } from '../game/AudioService';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const highScore = parseInt(localStorage.getItem('concrete_high_score') || '0');
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-yellow-400 selection:text-black overflow-hidden relative flex flex-col pointer-events-none">
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none z-0" />
      
      {/* Radial Glow - Subtle Ambient Fade */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/5 blur-[120px] rounded-full pointer-events-none z-0 animate-ambient-glow" />
 
      <nav className="relative z-10 px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center max-w-7xl mx-auto w-full pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <Logo />
        </motion.div>
        
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
          transition={{ duration: 1.5 }}
          className="relative mb-12 sm:mb-20 scale-90 sm:scale-100"
        >
          {/* Main Hero Logo Area */}
          <div className="relative group p-8">
            <Logo />
            <div className="shimmer opacity-20" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-6 sm:gap-10 w-full relative"
        >
          {/* Holographic Shimmer Layer */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-full blur-3xl opacity-50">
             <div className="absolute inset-0 holographic-bg" />
          </div>

          <div className="relative pointer-events-auto z-10">
            <motion.button 
              onClick={() => {
                AudioService.playClick();
                onStart();
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="skew-btn px-10 sm:px-20 py-4 sm:py-6 bg-yellow-400 text-black font-black uppercase italic tracking-[0.3em] text-base sm:text-xl transition-all hover:bg-white hover:scale-105 active:scale-95 z-20 group relative"
            >
              <span className="relative z-10">Initialize Engine</span>
            </motion.button>
            <div className={`absolute -inset-4 bg-yellow-400/5 blur-2xl rounded-full -z-10 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`} />
          </div>
          
          <div className="flex items-center gap-4 sm:gap-8 text-[8px] sm:text-[9px] font-bold text-white/20 tracking-[0.4em] uppercase">
             <div className="flex items-center gap-2">
               <Globe size={12} />
               <span>Live Node</span>
             </div>
             <div className="w-0.5 h-0.5 bg-white/20 rounded-full" />
             <div className="flex items-center gap-2 text-yellow-400/40 font-mono">
                <Rocket size={12} />
                <span>Record: {highScore.toLocaleString()}</span>
             </div>
          </div>
        </motion.div>
      </main>

      <div className="relative z-10 py-6 sm:py-12 mt-auto">
        <SocialLinks />
      </div>

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
