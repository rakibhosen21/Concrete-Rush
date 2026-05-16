import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Home } from 'lucide-react';

interface GameOverOverlayProps {
  score: number;
  cCollected: number;
  distance: number;
  multiplier: number;
  onRestart: () => void;
  onHome: () => void;
  userStats?: any;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ score, cCollected, onRestart, onHome }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-sm w-full bg-[#0a0a1a] border-2 border-yellow-400/20 rounded-2xl p-8 text-center relative shadow-[0_0_80px_rgba(250,204,21,0.15)]"
      >
        <h2 className="text-yellow-400 font-black italic tracking-[0.3em] text-2xl mb-8 uppercase">Game Over</h2>

        <div className="space-y-6 mb-10">
          <div>
            <div className="text-[10px] text-zinc-500 tracking-[0.4em] uppercase mb-1 font-black">Score</div>
            <div className="text-6xl font-black italic text-white tabular-nums leading-none tracking-tighter">{score.toLocaleString()}</div>
          </div>

          <div className="py-4 border-y border-white/5">
            <div className="text-[10px] text-yellow-500 tracking-[0.4em] uppercase mb-1 font-black">$C Collected</div>
            <div className="text-4xl font-black italic text-yellow-400 tabular-nums leading-none tracking-tighter">{cCollected}</div>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={onRestart}
            className="w-full bg-yellow-400 hover:bg-white text-black font-black py-4 rounded-xl text-lg tracking-[0.2em] italic transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <RefreshCw size={20} />
            PLAY AGAIN
          </button>

          <button 
            onClick={onHome}
            className="w-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 uppercase text-xs tracking-widest"
          >
            <Home size={18} />
            Home
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
