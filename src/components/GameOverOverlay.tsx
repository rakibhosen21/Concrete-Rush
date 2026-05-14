import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, Home, Share2, Check, ChevronRight } from 'lucide-react';
import { COLORS } from '../constants';

interface GameOverOverlayProps {
  score: number;
  distance: number;
  multiplier: number;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ score, distance, multiplier, onRestart, onHome }) => {
  const profile = JSON.parse(localStorage.getItem('concrete_profile') || '{}');
  const highScore = parseInt(localStorage.getItem('concrete_high_score') || '0');
  const [copied, setCopied] = useState(false);
  
  const getGrade = (s: number) => {
    if (s >= 500) return { l: 'S', d: 'NETWORK LEGEND' };
    if (s >= 250) return { l: 'A', d: 'GHOST RUNNER' };
    if (s >= 100) return { l: 'B', d: 'FIELD AGENT' };
    if (s >= 50) return { l: 'C', d: 'OPERATIVE' };
    return { l: 'D', d: 'SIGNAL LOST' };
  };

  const grade = getGrade(score);

  const handleShare = () => {
    const text = `Operative ${profile.name} complete. Yield capture: ${score}. Distance: ${distance}m. Node status: STABLE. Run concrete-rush.online`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openConcrete = () => {
    window.open('https://www.concrete.xyz/', '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 sm:p-6"
    >
      <div className="absolute inset-0 bg-grid-cyber opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-md w-full bg-[#0a0a1a] border-2 border-yellow-400/20 rounded-2xl p-6 sm:p-8 text-center relative shadow-[0_0_80px_rgba(250,204,21,0.15)] overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">System_Connection_Terminated</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="mb-8"
        >
           <div className="text-[10px] text-zinc-500 tracking-[0.4em] uppercase mb-2 font-black">Performance_Grade</div>
           <div className="text-6xl sm:text-8xl font-black italic text-yellow-400 leading-none drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">{grade.l}</div>
           <div className="text-[10px] font-mono text-white/40 tracking-[0.2em] uppercase mt-2">{grade.d}</div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col items-center">
            <span className="text-[8px] text-zinc-600 uppercase font-black mb-1 tracking-widest leading-none">Final Score</span>
            <span className="text-2xl sm:text-3xl font-black italic text-white tabular-nums">{score.toLocaleString()}</span>
          </div>
          <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col items-center">
            <span className="text-[8px] text-zinc-600 uppercase font-black mb-1 tracking-widest leading-none">Distance (M)</span>
            <span className="text-2xl sm:text-3xl font-black italic text-white tabular-nums">{distance}</span>
          </div>
          <div className="bg-black/40 p-4 rounded-xl border border-yellow-400/10 flex flex-col items-center">
            <span className="text-[8px] text-yellow-400/40 uppercase font-black mb-1 tracking-widest leading-none">High Score</span>
            <span className="text-2xl sm:text-3xl font-black italic text-yellow-400 tabular-nums">{Math.max(score, highScore).toLocaleString()}</span>
          </div>
          <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col items-center">
            <span className="text-[8px] text-zinc-600 uppercase font-black mb-1 tracking-widest leading-none">Peak Multiplier</span>
            <span className="text-2xl sm:text-3xl font-black italic text-white tabular-nums">X{multiplier.toFixed(1)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={onRestart}
            className="skew-btn w-full bg-yellow-400 hover:bg-white text-black font-black py-4 text-lg tracking-[0.2em] italic transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <RefreshCw size={20} />
            PLAY AGAIN
          </button>

          <button 
            onClick={openConcrete}
            className="w-full bg-[#0a0a1a] hover:bg-zinc-800 border-2 border-white/20 text-white font-black py-4 rounded-xl text-xs tracking-[0.3em] uppercase transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            START EXPLORING - CONCRETE
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleShare}
              className="w-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 uppercase text-[9px] tracking-widest"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
              {copied ? 'Copied' : 'Share Record'}
            </button>
            <button 
              onClick={onHome}
              className="w-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 uppercase text-[9px] tracking-widest"
            >
              <Home size={14} />
              Return Home
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
