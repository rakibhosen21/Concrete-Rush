import React from 'react';
import { motion } from 'motion/react';
import { Play, Home, Settings } from 'lucide-react';
import { AudioService } from '../game/AudioService';

interface PauseOverlayProps {
  onResume: () => void;
  onHome: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({ onResume, onHome }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
    >
      <div className="max-w-xs w-full bg-[#0a0a1a] border border-white/10 rounded-2xl p-8 text-center relative shadow-[0_0_80px_rgba(34,211,238,0.1)]">
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400 mb-8">System_Paused</div>
        
        <div className="space-y-4">
          <button 
            onClick={() => {
                AudioService.playClick();
                onResume();
            }}
            className="w-full bg-cyan-400 text-black font-black uppercase italic tracking-widest py-4 rounded-lg flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-95 group"
          >
            <Play size={20} fill="currentColor" />
            <span>Resume Link</span>
          </button>
          
          <button 
            onClick={() => {
                AudioService.playClick();
                onHome();
            }}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-black uppercase italic tracking-widest py-4 rounded-lg flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <Home size={20} />
            <span>Return Home</span>
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
             <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Neural Link v2.0 - Stabilized</div>
        </div>
      </div>
    </motion.div>
  );
};
