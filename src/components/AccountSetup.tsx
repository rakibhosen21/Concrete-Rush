import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ChevronRight, AlertTriangle } from 'lucide-react';

interface AccountSetupProps {
  onComplete: (username: string) => void;
}

export const AccountSetup: React.FC<AccountSetupProps> = ({ onComplete }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('concrete_agent_id', username.trim());
        onComplete(username.trim());
      } else {
        setError(data.error || 'Identity uplink failed');
      }
    } catch (err) {
      setError('Connection to Central Intelligence lost');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050208] flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
              <Shield className="text-cyan-400" size={32} />
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white mb-2 uppercase">Neural Link Registration</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Secure identity uplink required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 px-1">Agent ID</label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ENTER USERNAME..."
                maxLength={20}
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white font-mono uppercase tracking-widest outline-none focus:border-cyan-400/50 transition-all placeholder:text-zinc-700"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3"
              >
                <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span className="text-[10px] text-red-500 uppercase font-black tracking-widest leading-relaxed">
                  {error}
                </span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="w-full skew-btn bg-cyan-400 text-black py-4 font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Uplinking...' : 'Claim Identity'}
              <ChevronRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-[0.3em]">System access restricted to authorized operatives only</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
