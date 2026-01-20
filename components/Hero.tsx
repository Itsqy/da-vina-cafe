
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { DishVariant } from '../types';
import { SOCIAL_LINKS } from '../constants';

interface HeroProps {
  dish: DishVariant;
  index: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  scrollProgress: number;
  isDarkMode: boolean;
}

const Hero: React.FC<HeroProps> = ({ dish, index, total, onNext, onPrev, scrollProgress, isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isChanging, setIsChanging] = useState(false);
  const [textKey, setTextKey] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Calculate current frame index based on scroll progress
  const currentFrame = useMemo(() => {
    return Math.min(
      dish.frameCount - 1,
      Math.floor(scrollProgress * (dish.frameCount - 1))
    );
  }, [scrollProgress, dish.frameCount]);

  useEffect(() => {
    setTextKey(prev => prev + 1);
  }, [dish.id]);

  // Load image sequence
  useEffect(() => {
    setIsChanging(true);
    setIsLoaded(false);
    
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;
    
    // We try to load as many as possible for smoothness, but with a cap if needed
    const totalToLoad = dish.frameCount;
    
    // Create first frame immediately to show something
    const firstImg = new Image();
    firstImg.src = `${dish.sequenceBaseUrl}000${dish.suffix || '.webp'}`;
    firstImg.onload = () => {
      if (loadedImages.length === 0) {
        setImages([firstImg]); // Set at least one image to draw
      }
    };

    const loadSequence = async () => {
      const promises = [];
      for (let i = 0; i < totalToLoad; i++) {
        const frameStr = i.toString().padStart(3, '0');
        const img = new Image();
        img.src = `${dish.sequenceBaseUrl}${frameStr}${dish.suffix || '.webp'}`;
        
        const promise = new Promise((resolve) => {
          img.onload = () => {
            loadedCount++;
            resolve(img);
          };
          img.onerror = resolve; // Continue even if one fails
        });
        promises.push(promise);
        loadedImages[i] = img;
      }

      await Promise.all(promises);
      setImages(loadedImages);
      setIsChanging(false);
      setIsLoaded(true);
    };

    loadSequence();
  }, [dish.id, dish.sequenceBaseUrl, dish.suffix, dish.frameCount]);

  // Draw to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determine which image from the loaded set to draw
    // If we only have some images loaded, we scale the index
    const imgIndex = Math.min(
      Math.floor((currentFrame / (dish.frameCount || 1)) * images.length),
      images.length - 1
    );
    const img = images[imgIndex];

    if (img && img.complete && img.naturalWidth !== 0) {
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
  }, [currentFrame, images, dish.frameCount]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Background Sequence */}
      <canvas 
        ref={canvasRef} 
        width={1920} 
        height={1080}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${isChanging ? 'opacity-40 scale-110 blur-md' : 'opacity-100 scale-100 blur-0'}`}
      />

      {/* Hero Content Overlay */}
      <div className="absolute inset-0 flex items-center px-8 md:px-24 pointer-events-none z-10">
        <div key={textKey} className="max-w-xl animate-fade-in pointer-events-auto">
          <div className="flex flex-col space-y-2 mb-8">
            <h1 className="text-7xl md:text-[9rem] font-black tracking-tighter leading-[0.85] uppercase text-white drop-shadow-2xl">
              {dish.name.split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </h1>
            <div className="flex items-center space-x-4 mt-6">
              <span className="h-[1px] w-12" style={{ backgroundColor: dish.themeColor }}></span>
              <p className="text-[10px] font-black tracking-[0.5em] uppercase text-white/80">
                {dish.subtitle}
              </p>
            </div>
          </div>
          
          <p className="text-lg font-light text-white/70 leading-relaxed mb-12 max-w-sm drop-shadow-lg">
            {dish.description}
          </p>

          <div className="flex space-x-6">
            <button className="group px-10 py-4 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-500 font-bold uppercase tracking-widest text-[10px] backdrop-blur-md">
              Explore More
            </button>
            <button 
              className="px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] text-black shadow-2xl hover:scale-110 transition-all duration-300"
              style={{ backgroundColor: dish.themeColor }}
            >
              Add To Cart
            </button>
          </div>
        </div>

        {/* Right Side Variant Navigation */}
        <div className="absolute right-8 md:right-24 top-1/2 -translate-y-1/2 flex items-center pointer-events-auto z-20">
          <div className="text-[16rem] font-black text-white/5 select-none pointer-events-none tracking-tighter mr-12 leading-none">
            {index.toString().padStart(2, '0')}
          </div>

          <div className="flex flex-col items-center space-y-8">
            <button 
              onClick={onPrev}
              className="group flex flex-col items-center opacity-30 hover:opacity-100 transition-all duration-500"
            >
              <span className="text-[8px] uppercase tracking-widest font-black mb-3 group-hover:-translate-y-1 transition-transform">Prev</span>
              <i className="fa-solid fa-chevron-up text-[10px]"></i>
            </button>
            
            <div className="h-32 w-[1px] bg-white/10 relative">
               <div 
                 className="absolute top-0 left-0 w-full transition-all duration-700 ease-out"
                 style={{ 
                   height: `${(index / total) * 100}%`,
                   backgroundColor: dish.themeColor
                 }}
               ></div>
            </div>

            <button 
              onClick={onNext}
              className="group flex flex-col items-center opacity-30 hover:opacity-100 transition-all duration-500"
            >
              <i className="fa-solid fa-chevron-down text-[10px]"></i>
              <span className="text-[8px] uppercase tracking-widest font-black mt-3 group-hover:translate-y-1 transition-transform">Next</span>
            </button>
          </div>
        </div>
      </div>

      {/* Social Icons Bottom Center-ish */}
      <div className="absolute bottom-12 left-24 flex space-x-12 opacity-30 hover:opacity-100 transition-opacity z-20">
        {SOCIAL_LINKS.map((link) => (
          <a key={link.name} href={link.url} className="text-white hover:scale-125 transition-transform">
            <i className={`${link.icon} text-lg`}></i>
          </a>
        ))}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(-40px); filter: blur(10px); }
          to { opacity: 1; transform: translateX(0); filter: blur(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Hero;
