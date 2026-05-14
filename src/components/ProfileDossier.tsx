import React from 'react';
import { motion } from 'motion/react';
import { User, Shield, BarChart3, RotateCcw, X, FileText } from 'lucide-react';

interface ProfileDossierProps {
  onClose: () => void;
  onReset: () => void;
}

export const ProfileDossier: React.FC<ProfileDossierProps> = ({ onClose, onReset }) => {
  const profile = JSON.parse(localStorage.getItem('concrete_profile') || '{}');
  const highScore = localStorage.getItem('concrete_high_score') || '0';
  const totalYield = localStorage.getItem('concrete_total_yield') || '0';
  const gamesPlayed = localStorage.getItem('concrete_games_played') || '0';
  
  const getGrade = (s: number) => {
    if (s >= 200) return 'S';
    if (s >= 101) return 'A';
    if (s >= 51) return 'B';
    if (s >= 21) return 'C';
    return 'D';
  };

  const bestGrade = getGrade(parseInt(highScore));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-grid-cyber opacity-10 pointer-events-none" />
      <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
      
      <motion.div 
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        className="max-w-xl w-full bg-[#0c0c0e] border border-white/10 p-1 relative shadow-2xl"
      >
        <div className="absolute top-4 right-4 z-10">
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="border border-white/10 p-5 sm:p-8 m-1 max-h-[90vh] overflow-y-auto custom-scrollbar">
          {/* Dossier Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-6 sm:gap-8 mb-8 sm:mb-12 border-b border-white/10 pb-8 text-center sm:text-left">
             <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 min-w-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black border-2 border-yellow-400/50 rounded-lg flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_20px_rgba(250,204,21,0.2)] shrink-0">
                   {profile.avatar}
                </div>
                <div className="min-w-0 overflow-hidden">
                   <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-yellow-400 mb-1 sm:mb-2 leading-none uppercase truncate">Classified_Access_Dossier</div>
                   <h2 className="text-2xl sm:text-4xl font-black italic text-white tracking-tighter uppercase leading-none mb-1 sm:mb-2 truncate">{profile.displayName || profile.name}</h2>
                   <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
                      <span className="text-[10px] sm:text-sm font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-white/5 truncate">@{profile.username || profile.codename || 'AGENT'}</span>
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                         <span className="text-[8px] sm:text-[10px] font-mono text-zinc-400/40 uppercase tracking-widest leading-none">Status: Operational</span>
                      </div>
                   </div>
                </div>
             </div>
             <FileText size={32} className="text-white/5 sm:w-[48px] sm:h-[48px] hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 mb-8 sm:mb-12">
             <div className="space-y-6 sm:space-y-8">
                <div>
                   <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1 sm:mb-2 flex items-center gap-2">
                     <div className="w-2 h-0.5 bg-yellow-400" /> Best_Yield_Record
                   </div>
                   <div className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white tabular-nums">{parseInt(highScore).toLocaleString()}</div>
                </div>
                <div>
                   <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1 sm:mb-2 flex items-center gap-2">
                     <div className="w-2 h-0.5 bg-yellow-400" /> Best_Distance_M
                   </div>
                   <div className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white tabular-nums">{(profile.bestDistance || 0).toLocaleString()}</div>
                </div>
             </div>

             <div className="space-y-6 sm:space-y-8">
                <div>
                   <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1 sm:mb-2 flex items-center gap-2">
                     <div className="w-2 h-0.5 bg-yellow-400" /> Accumulated_Total
                   </div>
                   <div className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white tabular-nums">{parseInt(totalYield).toLocaleString()}</div>
                </div>
                <div>
                   <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1 sm:mb-2 flex items-center gap-2">
                     <div className="w-2 h-0.5 bg-yellow-400" /> Total_System_Runs
                   </div>
                   <div className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white tabular-nums">{gamesPlayed} <span className="text-xs text-zinc-700">CYCLES</span></div>
                </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between pt-6 sm:pt-8 border-t border-white/5">
              <div className="text-[7px] sm:text-[8px] font-mono opacity-20 uppercase tracking-[0.4em] sm:tracking-[0.5em] truncate max-w-full">Auth_ID_Ref: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
              <button 
                onClick={onReset}
                className="w-full sm:w-auto bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black border border-red-500/30 px-6 py-2 rounded font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all"
              >
                Wipe Identity
              </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
