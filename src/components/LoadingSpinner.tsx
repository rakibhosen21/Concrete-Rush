import React from 'react';
import { motion } from 'motion/react';

export const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative w-20 h-20">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 border-4 border-zinc-800 rounded-full"
                />
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 border-4 border-transparent border-t-yellow-400 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                </div>
            </div>
            <div className="font-mono text-[10px] tracking-[0.5em] text-yellow-400 animate-pulse uppercase">Syncing_Nodes...</div>
        </div>
    );
};
