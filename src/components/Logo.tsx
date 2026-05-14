import React from 'react';
import { motion } from 'motion/react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-4 select-none group pointer-events-auto">
      {/* Hexagon Icon */}
      <div className="relative scale-60 sm:scale-90 origin-left">
        <svg width="48" height="54" viewBox="0 0 48 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_4px_rgba(255,255,255,0.2)]">
          <path d="M24 2L44.7846 14V38L24 50L3.21539 38V14L24 2Z" stroke="white" strokeWidth="1" fill="white" fillOpacity="0.05"/>
          <path d="M24 10L36.1244 17V31L24 38L11.8756 31V17L24 10Z" stroke="white" strokeWidth="0.5" fill="white" fillOpacity="0.1"/>
        </svg>
        <motion.div 
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ repeat: Infinity, duration: 5 }}
          className="absolute inset-0 bg-white blur-xl rounded-full -z-10"
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-end leading-none gap-2">
          {/* CONCRETE */}
          <div className="relative">
            <h1 className="text-2xl sm:text-4xl font-black italic tracking-tighter text-zinc-500 uppercase">
              Concrete
            </h1>
          </div>
          
          {/* RUSH */}
          <div className="relative overflow-hidden px-1">
            <h1 className="text-2xl sm:text-4xl font-black italic tracking-tighter text-white uppercase group-hover:text-yellow-400 transition-colors">
              Rush
            </h1>
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              animate={{ left: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <div className="h-[1px] flex-grow bg-white/10" />
          <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-[0.6em] text-zinc-600 whitespace-nowrap">Neural_Link // v2.0</span>
        </div>
      </div>
    </div>
  );
};
