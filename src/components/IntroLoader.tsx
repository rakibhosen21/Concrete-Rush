import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, Zap } from 'lucide-react';

export const IntroLoader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('INITIALIZING NETWORK');

  useEffect(() => {
    const statuses = [
      'INITIALIZING NETWORK',
      'SYNCING CONCRETE CORE',
      'LOADING RUSH ENGINE',
      'ESTABLISHING NODE CONNECTION',
      'DECRYPTING ASSETS',
      'READY'
    ];

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return 100;
        }
        
        // Update status text based on progress
        const statusIdx = Math.floor((next / 100) * statuses.length);
        setStatus(statuses[Math.min(statusIdx, statuses.length - 1)]);
        
        return next;
      });
    }, 500); // Increased interval slightly

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80" />
      <div className="scanline" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-500/5 blur-[80px] rounded-full" />

      {/* Main Content */}
      <div className="relative flex flex-col items-center">
        <motion.div
          animate={{ scale: [1, 1.01, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="relative mb-12"
        >
          <h1 
            className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-600 tracking-tighter leading-none uppercase drop-shadow-2xl glitch"
            data-text="CONCRETE RUSH"
          >
            Concrete Rush
          </h1>
          <div className="absolute -bottom-4 right-0 text-sm md:text-lg font-bold tracking-[0.6em] text-yellow-400/20 uppercase">
            Establishing Link
          </div>
        </motion.div>

        {/* Loading Bar Container */}
        <div className="w-64 md:w-80 flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-yellow-400/60 tracking-[0.3em] uppercase">System_State</span>
              <span className="text-[9px] font-mono text-white/30">{status}</span>
            </div>
            <span className="text-xl font-black italic tabular-nums text-yellow-400">{Math.round(progress)}%</span>
          </div>
 
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-yellow-400"
            />
          </div>
 
          <div className="flex justify-between items-center opacity-10">
            <Terminal size={12} />
            <div className="text-[8px] font-mono">NODE_LINK_V42</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
