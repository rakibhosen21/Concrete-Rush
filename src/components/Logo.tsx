import React from 'react';
import { motion } from 'motion/react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-4 select-none group pointer-events-auto">
      {/* Hexagon Icon */}
      <div className="relative">
        <svg width="48" height="54" viewBox="0 0 48 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
          <path d="M24 2L44.7846 14V38L24 50L3.21539 38V14L24 2Z" stroke="#FACC15" strokeWidth="2" fill="#FACC15" fillOpacity="0.1"/>
          <path d="M24 10L36.1244 17V31L24 38L11.8756 31V17L24 10Z" stroke="#FACC15" strokeWidth="1" fill="#FACC15" fillOpacity="0.2"/>
        </svg>
        <motion.div 
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute inset-0 bg-yellow-400 blur-xl rounded-full -z-10"
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-end leading-none gap-2">
          {/* CONCRETE with crack effect */}
          <div className="relative overflow-hidden">
            <h1 className="text-4xl font-black italic tracking-tighter text-zinc-300 uppercase">
              Concrete
            </h1>
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 200 40">
              <path d="M10 20 L40 18 L70 22 L100 15 L140 25 L180 10" stroke="#000" strokeWidth="1" fill="none" strokeDasharray="4 2" />
            </svg>
          </div>
          
          {/* RUSH with speed streaks */}
          <div className="relative">
            <h1 className="text-4xl font-black italic tracking-tighter text-yellow-400 uppercase">
              Rush
            </h1>
            {/* Speed streaks SVG Filter/Paths */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-60">
              <div className="w-6 h-0.5 bg-cyan-400 animate-pulse" />
              <div className="w-10 h-0.5 bg-cyan-400 animate-pulse delay-75" />
              <div className="w-4 h-0.5 bg-cyan-400 animate-pulse delay-150" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <div className="h-[2px] flex-grow bg-gradient-to-r from-yellow-400/50 to-transparent" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Bag Hunt Protocol</span>
        </div>
      </div>
    </div>
  );
};
