import React from 'react';
import { motion } from 'motion/react';
import { FaXTwitter, FaDiscord } from 'react-icons/fa6';
import { IconType } from 'react-icons';
import { Network, Users } from 'lucide-react';

interface SocialItem {
  name: string;
  icon: IconType;
  url: string;
  glowColor: string;
  hoverIcon: string;
}

export const SocialLinks: React.FC = () => {
  const socials: SocialItem[] = [
    { 
      name: 'X', 
      icon: FaXTwitter, 
      url: 'https://x.com/ConcreteXYZ', 
      glowColor: 'bg-yellow-400/20',
      hoverIcon: 'group-hover:text-yellow-400'
    },
    { 
      name: 'Discord', 
      icon: FaDiscord, 
      url: 'https://discord.gg/concretexyz', 
      glowColor: 'bg-blue-500/20',
      hoverIcon: 'group-hover:text-blue-400'
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="w-full py-6 sm:py-12 flex flex-col items-center gap-6 sm:gap-10 relative z-10"
    >
      <div className="flex flex-col items-center gap-2 px-6">
        <div className="flex items-center gap-4 w-full max-w-xs sm:max-w-sm">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-yellow-400/60 whitespace-nowrap">
            Join the Network
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-zinc-600 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
          <Users size={8} className="sm:w-[10px] sm:h-[10px]" />
          <span>Active Community Rewards Live</span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-8">
        <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-1 sm:p-2 rounded-[20px] sm:rounded-[28px] flex gap-1 sm:gap-2">
          {socials.map((social) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                group relative flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 
                bg-black/40 backdrop-blur-sm border border-white/5 
                rounded-xl sm:rounded-2xl transition-all duration-300
                hover:border-white/20
              `}
            >
              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl sm:blur-2xl ${social.glowColor} -z-10`} />
              
              <div className={`text-zinc-400 transition-colors duration-300 ${social.hoverIcon}`}>
                <div className="sm:hidden">
                  <social.icon size={22} />
                </div>
                <div className="hidden sm:block">
                  <social.icon size={26} />
                </div>
              </div>
              
              {/* Tooltip-style name */}
              <span className="absolute -bottom-6 sm:-bottom-8 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 text-white/40">
                {social.name}
              </span>
            </motion.a>
          ))}
        </div>

        <div className="hidden sm:flex flex-col items-start gap-0.5 sm:gap-1 pl-4 sm:pl-8 border-l border-white/10">
           <div className="flex items-center gap-2 text-yellow-400">
             <Network size={12} className="sm:w-[14px] sm:h-[14px]" />
             <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Protocol Stats</span>
           </div>
           <div className="text-[7px] sm:text-[9px] font-mono text-white/30">MEMBERS: 24.8K</div>
           <div className="text-[7px] sm:text-[9px] font-mono text-white/30">ONLINE: 1.2K</div>
        </div>
      </div>
    </motion.div>
  );
};
