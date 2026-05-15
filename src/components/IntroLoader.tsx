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
      className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="w-full max-w-xs sm:max-w-md px-6 flex flex-col items-center gap-4">
        {/* Progress Bar Container */}
        <div className="w-full h-1 bg-zinc-900 overflow-hidden rounded-full">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
          />
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-mono tracking-[0.6em] text-cyan-400 uppercase font-black">
            INITIALIZING...
          </span>
          <span className="text-[10px] font-mono tracking-widest text-zinc-600 font-bold uppercase">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

