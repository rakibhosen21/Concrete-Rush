import React from 'react';
import { motion } from 'motion/react';
import { Trophy, FileText, X } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
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
        ...e
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
        <div className="bg-yellow-400 p-8 flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40 mb-1">Central_Intelligence</div>
              <h2 className="text-3xl font-black italic text-black tracking-tighter uppercase leading-none">Classified Leaderboard</h2>
           </div>
           <FileText size={48} className="text-black/20" />
        </div>

        <div className="p-8">
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
            {entries.length === 0 ? (
                <div className="text-center py-20 opacity-20 uppercase tracking-[0.5em] text-xs">No Data Logged</div>
            ) : (
                entries.map((entry) => (
                    <motion.div 
                        key={entry.rank}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: entry.rank * 0.05 }}
                        className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-lg group hover:border-yellow-400/40 transition-all font-mono"
                    >
                        <div className="flex items-center gap-6">
                            <span className={`text-xl font-black italic w-6 ${entry.rank === 1 ? 'text-yellow-400' : 'text-zinc-500'}`}>0{entry.rank}</span>
                            <span className="text-2xl">{entry.avatar}</span>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold uppercase tracking-widest text-zinc-300">{entry.name}</span>
                                <span className={`text-[8px] tracking-[0.2em] font-black ${
                                    entry.grade === 'S' ? 'text-yellow-400' : 
                                    entry.grade === 'A' ? 'text-white' : 'text-zinc-600'
                                }`}>GRADE_{entry.grade}</span>
                            </div>
                        </div>
                        <div className="text-2xl font-black italic tracking-tighter text-yellow-400 group-hover:scale-110 transition-transform">
                            {entry.score.toLocaleString()}
                        </div>
                    </motion.div>
                ))
            )}
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-black/20 text-center">
            <span className="text-[9px] font-mono opacity-20 uppercase tracking-[0.5em]">Network_Sync: Operational_Link_Beta</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
