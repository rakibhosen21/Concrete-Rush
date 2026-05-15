import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ChevronRight, AlertTriangle, Lock, User, KeyRound } from 'lucide-react';

interface AccountSetupProps {
  onComplete: (username: string) => void;
}

type Mode = 'LOGIN' | 'REGISTER';

export const AccountSetup: React.FC<AccountSetupProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<Mode>('REGISTER');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password || isLoading) return;

    if (mode === 'REGISTER' && password !== confirmPassword) {
      setError('PASSWORDS DO NOT MATCH');
      return;
    }

    if (mode === 'REGISTER' && password.length < 6) {
      setError('PASSWORD TOO SHORT (MIN 6 CHARS)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const endpoint = mode === 'REGISTER' ? '/api/register' : '/api/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(mode === 'REGISTER' ? 'IDENTITY CLAIMED' : 'UPLINK SUCCESS');
        localStorage.setItem('concrete_agent_id', username.trim());
        if (data.token) {
          localStorage.setItem('concrete_secret_token', data.token);
        }
        
        // Short delay to show success
        setTimeout(() => {
          onComplete(username.trim());
        }, 800);
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
            <h1 className="text-2xl font-black italic tracking-tighter text-white mb-2 uppercase">
              {mode === 'REGISTER' ? 'Neural Link Registration' : 'Agent Authentication'}
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Secure identity uplink required</p>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-white/5">
            <button 
              onClick={() => { setMode('LOGIN'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'LOGIN' ? 'bg-cyan-400 text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Returning Agent
            </button>
            <button 
              onClick={() => { setMode('REGISTER'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'REGISTER' ? 'bg-cyan-400 text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              New Agent
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Agent ID</label>
              <div className="relative">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="USERNAME..."
                  maxLength={20}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-mono uppercase text-xs tracking-widest outline-none focus:border-cyan-400/50 transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Neural Key (Password)</label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-mono tracking-widest outline-none focus:border-cyan-400/50 transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            {mode === 'REGISTER' && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Confirm Neural Key</label>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-mono tracking-widest outline-none focus:border-cyan-400/50 transition-all placeholder:text-zinc-700"
                  />
                </div>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-3"
                >
                  <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="text-[9px] text-red-500 uppercase font-black tracking-widest leading-relaxed">
                    {error}
                  </span>
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl flex items-start gap-3"
                >
                  <Shield size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-[9px] text-cyan-400 uppercase font-black tracking-widest leading-relaxed">
                    {success}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password}
              className="w-full skew-btn bg-cyan-400 text-black py-4 mt-2 font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white disabled:opacity-50 transition-all"
            >
              {isLoading ? 'UPLINKING...' : mode === 'REGISTER' ? 'Claim Identity' : 'Neural Link'}
              <ChevronRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-[0.3em]">System access restricted to authorized operatives only</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
