import React from 'react';
import { motion } from 'motion/react';
import { User, Shield, BarChart3, RotateCcw, X } from 'lucide-react';

interface ProfileDossierProps {
  onClose: () => void;
  onReset: () => void;
}

export const ProfileDossier: React.FC<ProfileDossierProps> = ({ onClose, onReset }) => {
  const profile = JSON.parse(localStorage.getItem('concrete_profile') || '{}');
  const highScore = localStorage.getItem('concrete_high_score') || '0';
  const totalYield = localStorage.getItem('concrete_total_yield') || '0';
  const gamesPlayed = localStorage.getItem('concrete_games_played') || '0';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-grid-cyber opacity-10 pointer-events-none" />
      
      <motion.div 
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        className="max-w-xl w-full bg-[#0c0c0e] border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-4 z-10">
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Dossier Header */}
        <div className="p-10 border-b border-white/5 flex items-center gap-8 bg-zinc-900/50">
           <div className="w-24 h-24 bg-black border-2 border-yellow-400/50 rounded-2xl flex items-center justify-center text-5xl shadow-[0_0_20px_rgba(250,204,21,0.2)]">
              {profile.avatar}
           </div>
           <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 mb-2">Operative_Dossier</div>
              <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase leading-none mb-2">{profile.name}</h2>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">System_Link: Active</span>
              </div>
           </div>
        </div>

        <div className="p-10 grid grid-cols-2 gap-8">
           <div className="space-y-6">
              <div>
                 <div className="flex items-center gap-2 mb-2">
                    <Shield size={12} className="text-yellow-400 opacity-50" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Record_Yield</span>
                 </div>
                 <div className="text-3xl font-black italic tracking-tighter text-white tabular-nums">{parseInt(highScore).toLocaleString()}</div>
              </div>
              <div>
                 <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={12} className="text-yellow-400 opacity-50" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Accumulated_Total</span>
                 </div>
                 <div className="text-3xl font-black italic tracking-tighter text-white tabular-nums">{parseInt(totalYield).toLocaleString()}</div>
              </div>
           </div>

           <div className="space-y-6">
              <div>
                 <div className="flex items-center gap-2 mb-2">
                    <Shield size={12} className="text-yellow-400 opacity-50" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Runtime_Count</span>
                 </div>
                 <div className="text-3xl font-black italic tracking-tighter text-white tabular-nums">{gamesPlayed} <span className="text-xs text-zinc-600">RUNS</span></div>
              </div>
              
              <button 
                onClick={onReset}
                className="w-full mt-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black border border-red-500/30 font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-all uppercase text-[10px] tracking-widest"
              >
                <RotateCcw size={14} />
                Reset Identity
              </button>
           </div>
        </div>

        <div className="p-6 bg-black/40 text-center border-t border-white/5">
             <span className="text-[8px] font-mono opacity-20 uppercase tracking-[1em]">Authorized_Personnel_Only</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
