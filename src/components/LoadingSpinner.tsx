import React from 'react';
import { motion } from 'motion/react';

export const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative w-12 h-12">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="absolute inset-0 border-[1px] border-zinc-800 rounded-full"
                />
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 border-[1px] border-transparent border-t-white rounded-full"
                />
            </div>
            <div className="font-mono text-[9px] tracking-[0.6em] text-zinc-500 uppercase">Syncing_Nodes</div>
        </div>
    );
};

