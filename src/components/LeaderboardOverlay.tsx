import React from 'react';
import { motion } from 'motion/react';
import { Trophy, FileText, X } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  username: string;
  avatar: string;
  score: number;
  distance: number;
  grade: string;
}

interface LeaderboardOverlayProps {
  onClose: () => void;
}

export const LeaderboardOverlay: React.FC<LeaderboardOverlayProps> = ({ onClose }) => {
  const localLeaderboard = JSON.parse(localStorage.getItem('concrete_leaderboard') || '[]');
  
  // Sort and pick top 10
  const entries: LeaderboardEntry[] = (localLeaderboard as any[])
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((e, index) => ({
        rank: index + 1,
        ...e,
        displayName: e.displayName || e.name || 'ANON OPERATIVE',
        username: e.username || e.codename || 'ID_UNKNOWN'
    }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-grid-cyber opacity-5 pointer-events-none" />
      
      <motion.div 
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        className="max-w-2xl w-full bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-4 z-10">
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Cyberpunk Header */}
        <div className="bg-yellow-400 p-6 sm:p-8 flex items-center justify-between">
           <div>
              <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-black/40 mb-0.5 sm:mb-1 leading-none uppercase">Central_Intelligence</div>
              <h2 className="text-xl sm:text-3xl font-black italic text-black tracking-tighter uppercase leading-tight">Classified Ranking</h2>
           </div>
           <FileText size={32} className="text-black/20 sm:w-[48px] sm:h-[48px]" />
        </div>

        <div className="p-4 sm:p-8">
          <div className="space-y-2 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
            {entries.length === 0 ? (
                <div className="text-center py-10 sm:py-20 opacity-20 uppercase tracking-[0.4em] sm:tracking-[0.5em] text-[10px] sm:text-xs">No Data Logged</div>
            ) : (
                entries.map((entry) => (
                    <motion.div 
                        key={entry.rank}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: entry.rank * 0.05 }}
                        className="flex items-center justify-between p-3 sm:p-4 bg-black/40 border border-white/5 rounded-lg group hover:border-yellow-400/40 transition-all font-mono"
                    >
                        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                            <span className={`text-sm sm:text-xl font-black italic w-5 sm:w-6 ${entry.rank === 1 ? 'text-yellow-400' : 'text-zinc-500'}`}>{entry.rank < 10 ? `0${entry.rank}` : entry.rank}</span>
                            <span className="text-xl sm:text-2xl shrink-0">{entry.avatar}</span>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-zinc-300 truncate">{entry.displayName}</span>
                                <span className="text-[6px] sm:text-[8px] font-mono text-zinc-500 uppercase tracking-widest truncate">@{entry.username}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 ml-2">
                            <div className="text-lg sm:text-2xl font-black italic tracking-tighter text-yellow-400 group-hover:scale-110 transition-transform tabular-nums">
                                {entry.score.toLocaleString()}
                            </div>
                            <div className="text-[6px] sm:text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                                {entry.distance}M | GRADE_{entry.grade}
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-white/5 bg-black/20 text-center">
            <span className="text-[7px] sm:text-[9px] font-mono opacity-20 uppercase tracking-[0.4em] sm:tracking-[0.5em]">Network_Sync: Operational_Link_Beta</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
