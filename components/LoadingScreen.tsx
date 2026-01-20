
import React, { useState, useEffect } from 'react';
import { DishVariant } from '../types';

interface LoadingScreenProps {
  dish: DishVariant;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ dish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 opacity-10 blur-[150px] animate-pulse"
        style={{ backgroundColor: dish.themeColor }}
      ></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-20 flex flex-col items-center animate-in fade-in duration-1000">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 italic">CAFE DA VINA</h2>
          <div className="flex items-center space-x-4">
             <div className="h-[1px] w-8 bg-white/20"></div>
             <p className="text-[10px] uppercase tracking-[0.8em] opacity-40">The Cinematic Experience</p>
             <div className="h-[1px] w-8 bg-white/20"></div>
          </div>
        </div>

        <div className="w-80 space-y-6">
          <div className="flex justify-between items-baseline px-2">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Preloading {dish.name}</span>
            <span className="text-2xl font-black tracking-tighter">{Math.floor(progress)}%</span>
          </div>
          <div className="w-full h-[1px] bg-white/10 overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full transition-all duration-300 ease-out shadow-[0_0_30px_rgba(255,255,255,0.8)]"
              style={{ 
                width: `${progress}%`,
                backgroundColor: dish.themeColor || 'white'
              }}
            ></div>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-3 gap-12 opacity-10">
          {['Purity', 'Aesthetics', 'Heritage'].map(label => (
            <div key={label} className="flex flex-col items-center space-y-4">
               <span className="text-[8px] uppercase font-black tracking-[0.5em]">{label}</span>
               <div className="h-12 w-[1px] bg-white"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
