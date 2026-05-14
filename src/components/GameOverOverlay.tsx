import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, Home, Share2, Check } from 'lucide-react';
import { COLORS } from '../constants';

interface GameOverOverlayProps {
  score: number;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ score, onRestart, onHome }) => {
  const highScore = parseInt(localStorage.getItem('concrete_high_score') || '0');
  const isNewHigh = score > highScore;
  const [copied, setCopied] = useState(false);
  
  if (isNewHigh) {
    localStorage.setItem('concrete_high_score', score.toString());
  }

  const getGrade = (s: number) => {
    if (s >= 200) return { l: 'S', d: 'NETWORK LEGEND' };
    if (s >= 101) return { l: 'A', d: 'GHOST RUNNER' };
    if (s >= 51) return { l: 'B', d: 'FIELD AGENT' };
    if (s >= 21) return { l: 'C', d: 'OPERATIVE' };
    return { l: 'D', d: 'SIGNAL LOST' };
  };

  const grade = getGrade(score);

  const handleShare = () => {
    const text = `Protocol complete. Yield capture: ${score}. Grade: ${grade.l}. Node status: STABLE. Run concrete-rush.online`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6"
    >
      <div className="absolute inset-0 bg-grid-cyber opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900 border-2 border-yellow-400/20 rounded-xl p-8 text-center relative shadow-[0_0_100px_rgba(250,204,21,0.1)]"
      >
        <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-400/20 relative">
          <Trophy size={40} className="text-yellow-400" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full bg-yellow-400/20" 
          />
        </div>
        
        <h2 
          className="text-4xl font-black text-white mb-1 italic tracking-tighter uppercase relative glitch"
          data-text="RUN TERMINATED"
        >
          Run Terminated
        </h2>
        <p className="text-zinc-500 mb-8 font-bold tracking-widest text-[9px] uppercase">
          Frequency destabilized. Yield captured.
        </p>

        <motion.div 
          initial={{ opacity: 0, scale: 2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 10, delay: 0.5 }}
          className="mb-8 p-4 bg-zinc-800/50 rounded-lg border border-white/5"
        >
           <div className="text-[10px] text-zinc-500 tracking-[0.4em] uppercase mb-1">Performance_Grade</div>
           <div className="text-6xl font-black italic text-yellow-400 leading-none mb-1">{grade.l}</div>
           <div className="text-[10px] font-mono text-white/40 tracking-widest">{grade.d}</div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-black/20 p-5 rounded-lg border border-white/5">
            <div className="text-[9px] text-zinc-600 uppercase font-bold mb-1 tracking-widest">Yield</div>
            <div className="text-3xl font-black italic tracking-tighter text-white">{score.toLocaleString()}</div>
          </div>
          <div className="bg-black/20 p-5 rounded-lg border border-white/5">
            <div className="text-[9px] text-zinc-600 uppercase font-bold mb-1 tracking-widest">Peak</div>
            <div className="text-3xl font-black italic tracking-tighter text-yellow-400">{(isNewHigh ? score : highScore).toLocaleString()}</div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onRestart}
            className="skew-btn w-full bg-yellow-400 hover:bg-white text-black font-black py-4 text-lg tracking-wider italic transition-all active:scale-95"
          >
            <span>Restart Protocol</span>
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleShare}
              className="w-full bg-zinc-800/50 hover:bg-zinc-700/50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all border border-white/5 uppercase text-[10px] tracking-widest"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} className="opacity-50" />}
              {copied ? 'Copied' : 'Share'}
            </button>
            <button 
              onClick={onHome}
              className="w-full bg-zinc-800/50 hover:bg-zinc-700/50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all border border-white/5 uppercase text-[10px] tracking-widest"
            >
              <Home size={14} className="opacity-50" />
              Exit
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
