import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Lock, CheckCircle2, ShoppingBag, Zap } from 'lucide-react';

interface Skin {
  id: string;
  name: string;
  price: number;
  bodyColor: number;
  glowColor: number;
  description: string;
}

export const SKINS: Skin[] = [
  { id: 'NEURAL RUNNER', name: 'NEURAL RUNNER', price: 0, bodyColor: 0x050505, glowColor: 0x00f0ff, description: 'Standard issue neural-linked operative vehicle.' },
  { id: 'CYBER PHANTOM', name: 'CYBER PHANTOM', price: 50, bodyColor: 0x2a0033, glowColor: 0xff00ff, description: 'Low-profile stealth chassis with neon-pink stabilizers.' },
  { id: 'GOLDEN CIRCUIT', name: 'GOLDEN CIRCUIT', price: 100, bodyColor: 0x3d3500, glowColor: 0xfacc15, description: 'Experimental high-yield gold plating for the elite.' },
  { id: 'VOID STALKER', name: 'VOID STALKER', price: 200, bodyColor: 0x000000, glowColor: 0xff0000, description: 'Blackened titanium hull designed for high-risk extraction.' },
  { id: 'CONCRETE KING', name: 'CONCRETE KING', price: 500, bodyColor: 0xffffff, glowColor: 0x00ffff, description: 'The absolute pinnacle of street-side engineering.' }
];

interface GarageProps {
  onClose: () => void;
  userStats: any;
  onUpdateUser: (user: any) => void;
}

export const Garage: React.FC<GarageProps> = ({ onClose, userStats, onUpdateUser }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSkin = SKINS[selectedIdx];
  const isUnlocked = userStats?.unlockedSkins?.includes(currentSkin.id);
  const isEquipped = userStats?.equippedSkin === currentSkin.id;

  const handleAction = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    const action = isUnlocked ? 'EQUIP' : 'UNLOCK';
    
    try {
      const res = await fetch('/api/garage/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userStats.username,
          action,
          skinId: currentSkin.id,
          cost: currentSkin.price
        })
      });

      const data = await res.json();
      if (res.ok) {
        onUpdateUser(data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection failure');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex flex-col pointer-events-auto">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
        <button 
          onClick={onClose} 
          className="flex items-center gap-1.5 text-cyan-400 hover:text-white transition-colors group active:scale-95"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back_to_Base</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black italic tracking-tighter uppercase">Operations_Garage</h2>
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Vehicle Customization Hub</div>
        </div>
        <div className="flex items-center gap-2 bg-yellow-400/10 px-4 py-2 rounded-lg border border-yellow-400/20">
          <Zap size={14} className="text-yellow-400" />
          <span className="text-sm font-black italic text-yellow-400 tabular-nums">{userStats?.totalCoins || 0} $C</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col md:grid md:grid-cols-2 gap-12 max-w-7xl mx-auto w-full">
        {/* Preview Area */}
        <div className="flex flex-col items-center justify-center space-y-8">
          <motion.div 
            key={currentSkin.id}
            initial={{ scale: 0.8, opacity: 0, rotate: 5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            className="relative w-48 h-80 flex items-center justify-center"
          >
            {/* Visual Preview (Representational) */}
            <div 
              style={{ 
                backgroundColor: `#${currentSkin.bodyColor.toString(16).padStart(6, '0')}`,
                boxShadow: `0 0 40px #${currentSkin.glowColor.toString(16).padStart(6, '0')}44`
              }} 
              className="w-24 h-48 rounded-2xl border border-white/20 relative"
            >
                <div 
                    style={{ borderColor: `#${currentSkin.glowColor.toString(16).padStart(6, '0')}` }}
                    className="absolute inset-2 border-2 border-dashed opacity-50 rounded-xl"
                />
                {/* Cabin */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-20 bg-black/40 rounded-lg border border-white/10" />
            </div>
            
            {/* Glow Light */}
            <div 
                style={{ backgroundColor: `#${currentSkin.glowColor.toString(16).padStart(6, '0')}` }}
                className="absolute bottom-[-20%] w-32 h-32 blur-[60px] opacity-20 rounded-full"
            />
          </motion.div>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black italic text-white uppercase">{currentSkin.name}</h3>
            <p className="text-xs text-zinc-500 font-mono tracking-tight max-w-xs">{currentSkin.description}</p>
          </div>
        </div>

        {/* List Area */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            {SKINS.map((skin, idx) => {
              const unlocked = userStats?.unlockedSkins?.includes(skin.id);
              const equipped = userStats?.equippedSkin === skin.id;
              
              return (
                <button
                  key={skin.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={`relative p-4 rounded-xl border flex items-center justify-between transition-all group ${
                    selectedIdx === idx 
                      ? 'bg-white/10 border-white/30' 
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                        style={{ backgroundColor: `#${skin.glowColor.toString(16).padStart(6, '0')}` }}
                        className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                    />
                    <div className="text-left">
                       <span className={`block text-xs font-black italic tracking-widest uppercase transition-colors ${selectedIdx === idx ? 'text-white' : 'text-zinc-500'}`}>
                         {skin.name}
                       </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {unlocked ? (
                      equipped ? (
                        <span className="text-[8px] font-black uppercase text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/20">Active</span>
                      ) : (
                        <span className="text-[8px] font-black uppercase text-zinc-500">Unlocked</span>
                      )
                    ) : (
                      <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded">
                        <Lock size={10} className="text-zinc-600" />
                        <span className="text-[10px] font-black tabular-nums text-yellow-500">{skin.price}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 text-xs font-black text-red-500 flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  <Lock size={12} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleAction}
              disabled={isLoading || isEquipped}
              className={`w-full py-5 rounded-xl font-black italic uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
                isEquipped 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5' 
                  : isUnlocked
                    ? 'bg-white text-black hover:bg-cyan-400'
                    : 'bg-yellow-400 text-black hover:bg-white'
              }`}
            >
              {isLoading ? (
                'Processing...'
              ) : isEquipped ? (
                <>
                  <CheckCircle2 size={18} /> Equipped
                </>
              ) : isUnlocked ? (
                <>
                  Equip Vehicle
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> Unlock For {currentSkin.price} $C
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
