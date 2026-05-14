import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Database, Network, Bike } from 'lucide-react';

export const IntroLoader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    { text: 'INITIALIZING ENGINE', icon: Cpu },
    { text: 'LOADING ASSETS', icon: Database },
    { text: 'CONNECTING NETWORK', icon: Network },
    { text: 'PREPARING GAMEPLAY', icon: Bike }
  ];

  useEffect(() => {
    const totalDuration = 4000; // 4 seconds loading
    const intervalTime = 50;
    const steps = totalDuration / intervalTime;
    const increment = 100 / steps;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + increment + Math.random() * 0.5, 100);
        
        // Update status text based on progress thresholds
        const newIndex = Math.floor((next / 100) * statuses.length);
        if (newIndex !== statusIndex && newIndex < statuses.length) {
          setStatusIndex(newIndex);
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onComplete, statusIndex]);

  const StatusIcon = statuses[Math.min(statusIndex, statuses.length - 1)].icon;

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="fixed inset-0 z-[1000] bg-[#050208] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Cinematic Background Scene */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 6, ease: "easeOut" }}
        className="absolute inset-0"
      >
        {/* Subtle City Silhouette / Highway Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#22d3ee05_0%,transparent_70%)]" />
        <div className="absolute bottom-0 w-full h-[300px] bg-gradient-to-t from-[#00f0ff08] to-transparent" />
        
        {/* Bike Silhouette */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <Bike size={320} strokeWidth={0.5} className="text-white blur-xl" />
        </div>

        {/* Ambient Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                opacity: 0
              }}
              animate={{ 
                y: [null, "-10%"],
                opacity: [0, 0.3, 0]
              }}
              transition={{ 
                duration: 5 + Math.random() * 5, 
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full blur-[1px]"
            />
          ))}
        </div>
      </motion.div>

      {/* Main Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full py-20 px-8 w-full max-w-lg">
        {/* Top Spacer or Small Motto */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-[10px] font-mono tracking-[0.8em] text-zinc-500 uppercase"
        >
          Neural_Interface_Established
        </motion.div>

        {/* Center Logo */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative group overflow-hidden px-4 py-2">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase flex flex-col items-center leading-none">
              <span className="text-zinc-700/40 mb-[-0.2em] translate-x-4 mix-blend-screen">CONCRETE</span>
              <span className="relative text-zinc-100">
                RUSH
                <div className="shimmer" />
              </span>
            </h1>
            <motion.div 
              className="absolute -inset-x-20 inset-y-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-30deg]"
              animate={{ left: ['-100%', '200%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ delay: 1, duration: 1 }}
            className="h-[1px] bg-yellow-400/50" 
          />
        </motion.div>

        {/* Bottom Loading Area */}
        <div className="w-full space-y-8">
          <div className="flex flex-col items-center gap-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={statusIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <StatusIcon size={16} className="text-yellow-400/80" />
                <span className="text-xs font-mono tracking-[0.4em] text-zinc-400 uppercase">
                  {statuses[statusIndex].text}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Progress Bar Container */}
            <div className="w-full space-y-3">
              <div className="relative h-[2px] w-full bg-zinc-900 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="absolute inset-y-0 left-0 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-600 tracking-wider">
                <span>SYSTEM_VR_BOOT</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-white/5" />
      <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-white/5" />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-white/5" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-white/5" />
    </motion.div>
  );
};

