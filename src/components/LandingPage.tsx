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
 
      <nav className="relative z-10 px-4 sm:px-8 py-4 sm:py-6 flex justify-end items-center max-w-7xl mx-auto w-full pointer-events-auto">
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
          <h1 className="text-4xl sm:text-7xl font-black italic tracking-tighter text-white mb-2 uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">CONCRETE RUSH</h1>
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.8em] text-cyan-400">NEURAL LINK ACTIVE</div>
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
              <span className="relative z-10">INITIALIZE ENGINE</span>
            </motion.button>
            <div className={`absolute -inset-4 bg-yellow-400/5 blur-2xl rounded-full -z-10 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`} />
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 sm:gap-8 text-[8px] sm:text-[9px] font-bold text-white/20 tracking-[0.4em] uppercase">
               <div className="flex items-center gap-2">
                  <Globe size={12} />
                  <span>Protocol_Live</span>
               </div>
               <div className="w-0.5 h-0.5 bg-white/20 rounded-full" />
               <div className="flex items-center gap-2">
                  <span>Members: 24.3K</span>
               </div>
               <div className="w-0.5 h-0.5 bg-white/20 rounded-full" />
               <div className="flex items-center gap-2 text-yellow-400/40">
                  <span>Online: 1.2K</span>
               </div>
            </div>
            
             <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4">
                <a href="https://x.com/ConcreteXYZ" target="_blank" rel="noopener noreferrer" className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 hover:border-yellow-400/30 transition-all group">
                   <svg className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://discord.gg/concretexyz" target="_blank" rel="noopener noreferrer" className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 hover:border-white transition-all group">
                   <svg className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.46-.63.862-1.31 1.2-2.022a.076.076 0 0 0-.041-.105 13.11 13.11 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.293a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.101.246.199.37.293a.077.077 0 0 1-.006.127 12.29 12.29 0 0 1-1.873.892.077.077 0 0 0-.041.107c.34.71.742 1.39 1.2 2.02a.078.078 0 0 0 .084.028 19.83 19.83 0 0 0 6.002-3.03.085.085 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.18 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.18 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/></svg>
                </a>
             </div>
          </div>
        </motion.div>
      </main>

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
