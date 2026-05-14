import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Volume2, VolumeX, Globe, Rocket } from 'lucide-react';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const highScore = parseInt(localStorage.getItem('concrete_high_score') || '0');
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Parallax Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-500, 500], [5, -5]);
  const rotateY = useTransform(smoothX, [-500, 500], [-5, 5]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-yellow-400 selection:text-black overflow-hidden relative flex flex-col pointer-events-none">
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none z-0" />
      <div className="scanline z-10" />
      
      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none z-0" />
 
      <nav className="relative z-10 px-8 py-6 flex justify-between items-center max-w-7xl mx-auto w-full pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <Logo />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-8 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500"
        >
          <div 
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-1 h-1 rounded-full bg-green-500" />
            <span className="group-hover:text-yellow-400 transition-colors tracking-widest uppercase">Node_Stable</span>
          </div>
        </motion.div>
      </nav>
 
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto px-6 py-12">
        <motion.div
          style={{ rotateX, rotateY, perspective: 800 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative mb-20"
        >
          {/* Main Hero Logo Area */}
          <Logo />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-10 w-full"
        >
          <div className="relative pointer-events-auto">
            <motion.button 
              onClick={onStart}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              animate={{ 
                boxShadow: ["0 0 20px rgba(0, 240, 255, 0.2)", "0 0 40px rgba(0, 240, 255, 0.5)", "0 0 20px rgba(0, 240, 255, 0.2)"]
              }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="skew-btn px-20 py-8 bg-yellow-400 text-black font-black uppercase italic tracking-[0.3em] text-2xl transition-all hover:bg-white hover:scale-105 active:scale-95 z-20 group relative border-2 border-transparent hover:border-[#00f0ff]"
            >
              <span>Initialize Engine</span>
            </motion.button>
            <div className={`absolute -inset-4 bg-yellow-400/5 blur-2xl rounded-full -z-10 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`} />
          </div>
          
          <div className="flex items-center gap-8 text-[9px] font-bold text-white/20 tracking-[0.4em] uppercase">
             <div className="flex items-center gap-2">
               <Globe size={14} />
               <span>Live Node</span>
             </div>
             <div className="w-1 h-1 bg-white/20 rounded-full" />
             <div className="flex items-center gap-2 text-yellow-400/40">
                <Rocket size={14} />
                <span>Record: {highScore.toLocaleString()}</span>
             </div>
          </div>
        </motion.div>
      </main>

      <div className="relative z-10 py-12 mt-auto">
        <SocialLinks />
      </div>

      <div className="absolute bottom-8 left-0 w-full px-8 flex justify-between items-end pointer-events-none opacity-40">
        <div className="hidden sm:block text-[8px] font-mono tracking-[0.5em] uppercase vertical-text">SECURE_LAYER_STABLE</div>
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 text-[10px] font-bold uppercase tracking-widest text-white/30 items-center">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-sm">
             <span className="px-2 py-0.5 border border-white/20 rounded-sm text-yellow-400">A / D</span>
             <span className="text-white/60">Steer Axis</span>
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-sm">
             <span className="px-2 py-0.5 border border-white/20 rounded-sm text-yellow-400">P</span>
             <span className="text-white/60">Pause Task</span>
          </div>
        </div>
        <div className="hidden sm:block text-[8px] font-mono tracking-[0.5em] uppercase vertical-text">TERMINAL_REF_094X</div>
      </div>
    </div>
  );
};
