import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ChevronRight, Terminal } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: (profile: { name: string; avatar: string; codename: string }) => void;
}

const AVATAR_DATA = [
  { icon: '🤖', codename: 'UNIT-7' },
  { icon: '🦾', codename: 'CHROME' },
  { icon: '👾', codename: 'PHANTOM' },
  { icon: '💀', codename: 'REAPER' },
  { icon: '🔮', codename: 'ORACLE' },
  { icon: '⚡', codename: 'VOLTAGE' },
];

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_DATA[0]);
  const [terminalText, setTerminalText] = useState('');
  const [step, setStep] = useState(0);

  const fullText = "INITIALIZING SECURE CHANNEL... IDENTITY VERIFICATION REQUIRED";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTerminalText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) {
        clearInterval(interval);
        setStep(1);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 3) {
      onComplete({ 
        name: name.trim().toUpperCase(), 
        avatar: selectedAvatar.icon,
        codename: selectedAvatar.codename
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] bg-[#050208] flex items-center justify-center p-6 font-mono"
    >
      <div className="absolute inset-0 bg-grid-cyber opacity-10 pointer-events-none" />
      <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-2xl w-full bg-[#0a0a1a] border border-green-500/30 rounded-lg p-10 relative overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.1)]"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Terminal size={120} className="text-green-500" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <div className="text-green-500 text-[10px] uppercase tracking-[0.4em]">Secure_Terminal_v4.2</div>
          </div>

          <div className="h-12 mb-8">
            <p className="text-green-500/80 text-sm leading-relaxed">
              {terminalText}
              <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse" />
            </p>
          </div>

          <AnimatePresence>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="relative">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-green-500/50 mb-3 ml-1">Establish_Codename</label>
                    <input 
                      type="text" 
                      maxLength={16}
                      value={name}
                      onChange={(e) => setName(e.target.value.toUpperCase())}
                      placeholder="ENTER OPERATIVE NAME..."
                      className="w-full bg-black/60 border border-green-500/20 rounded-lg px-6 py-5 text-green-500 font-mono text-xl focus:border-green-400 outline-none transition-all placeholder:text-green-900 shadow-inner"
                      required
                    />
                    {name.length > 0 && name.length < 3 && (
                      <div className="absolute -bottom-6 left-0 text-[9px] text-red-500 uppercase tracking-widest animate-pulse">
                        Identity Unverified — Enter Codename (Min 3 Chars)
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-green-500/50 mb-4 ml-1">Identity_Avatar_Select</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                      {AVATAR_DATA.map(av => (
                        <button
                          key={av.codename}
                          type="button"
                          onClick={() => setSelectedAvatar(av)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all group ${
                            selectedAvatar.codename === av.codename 
                              ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-105' 
                              : 'border-white/5 bg-black/40 hover:border-green-500/30'
                          }`}
                        >
                          <span className="text-3xl">{av.icon}</span>
                          <span className={`text-[8px] font-bold tracking-tighter uppercase ${
                            selectedAvatar.codename === av.codename ? 'text-cyan-400' : 'text-zinc-600'
                          }`}>
                            {av.codename}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={name.trim().length < 3}
                    className="skew-btn w-full bg-yellow-400 disabled:opacity-30 disabled:grayscale text-black font-black py-6 uppercase italic tracking-[0.3em] text-xl group relative overflow-hidden transition-all active:scale-95"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:-translate-x-full transition-transform duration-500 skew-x-12" />
                    <span className="flex items-center justify-center gap-4 relative z-10">
                      Confirm Identity <ChevronRight size={20} />
                    </span>
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
