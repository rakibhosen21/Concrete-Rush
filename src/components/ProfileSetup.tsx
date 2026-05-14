import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ChevronRight } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: (profile: { name: string; avatar: string }) => void;
}

const AVATARS = ['🤖', '🦾', '👾', '💀', '🔮', '⚡'];

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete({ name: name.trim(), avatar: selectedAvatar });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] bg-[#050208] flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-grid-cyber opacity-10 pointer-events-none" />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900 border border-yellow-400/30 rounded-2xl p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Shield size={80} className="text-yellow-400" />
        </div>

        <div className="relative z-10">
          <div className="text-yellow-400 font-black uppercase tracking-[0.4em] text-[10px] mb-2">Protocol_Initialization</div>
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-8">Create Operative Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Callsign</label>
              <input 
                type="text" 
                maxLength={16}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ENTER_NAME..."
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-4 text-white font-mono focus:border-yellow-400 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Identity_Icon</label>
              <div className="grid grid-cols-6 gap-3">
                {AVATARS.map(av => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-all text-2xl ${
                      selectedAvatar === av ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/5 bg-black/40'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="skew-btn w-full bg-yellow-400 disabled:opacity-50 disabled:grayscale text-black font-black py-5 uppercase italic tracking-widest text-lg group overflow-hidden"
            >
              <span className="flex items-center justify-center gap-2">
                Establish Link <ChevronRight size={20} />
              </span>
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
