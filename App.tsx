
import React, { useState, useEffect, useCallback } from 'react';
import { getDocs, collection, doc, updateDoc } from 'firebase/firestore';
import { INITIAL_DISHES } from './constants';
import { DishVariant } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Sections from './components/Sections';
import AdminDashboard from './components/AdminDashboard';
import LoadingScreen from './components/LoadingScreen';
import { db } from './firebase';

const App: React.FC = () => {
  const [dishes, setDishes] = useState<DishVariant[]>(INITIAL_DISHES);
  const [currentDishIndex, setCurrentDishIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const currentDish = dishes[currentDishIndex];

  useEffect(() => {
    const handleScroll = () => {
      const stickyContainer = document.querySelector('.scroll-container');
      if (!stickyContainer) return;

      const rect = stickyContainer.getBoundingClientRect();
      const containerTop = window.scrollY + rect.top;
      const containerHeight = stickyContainer.clientHeight;
      const windowHeight = window.innerHeight;

      // Calculate how far into the container we've scrolled
      // progress = (currentScroll - containerTop) / (containerHeight - windowHeight)
      const relativeScroll = window.scrollY - containerTop;
      const maxScroll = containerHeight - windowHeight;

      const progress = Math.min(Math.max(relativeScroll / maxScroll, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load dishes from Firestore on startup (with INITIAL_DISHES as fallback)
  useEffect(() => {
    const loadDishes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'dishes'));
        if (!snapshot.empty) {
          const loaded: DishVariant[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<DishVariant, 'id'>),
          }));

          // Auto-migrate from Supabase to local assets if detected
          const updatedLoaded = loaded.map(d => {
            if (d.id === 'avocado-salmon-1' && d.sequenceBaseUrl.includes('supabase')) {
              const newUrl = '/gif-avocado-salmon/frame_';
              // Update in background
              updateDoc(doc(db, 'dishes', d.id), { sequenceBaseUrl: newUrl })
                .then(() => console.log('Migrated Supabase URL to local for', d.id))
                .catch(e => console.error('Migration failed', e));
              return { ...d, sequenceBaseUrl: newUrl };
            }
            return d;
          });

          setDishes(updatedLoaded);
        }
      } catch (error) {
        console.warn('Failed to load dishes from Firestore, using defaults.', error);
      }
    };

    loadDishes();
  }, []);

  const handleNextDish = useCallback(() => {
    setCurrentDishIndex((prev) => (prev + 1) % dishes.length);
  }, [dishes.length]);

  const handlePrevDish = useCallback(() => {
    setCurrentDishIndex((prev) => (prev - 1 + dishes.length) % dishes.length);
  }, [dishes.length]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    // Initial artificial loading for cinematic effect
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${isDarkMode ? 'bg-zinc-950 text-white' : 'bg-stone-50 text-zinc-900'} min-h-screen transition-colors duration-1000 selection:bg-white selection:text-black`}>
      {isLoading && <LoadingScreen dish={currentDish} />}

      <Navbar
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        themeColor={currentDish.themeColor}
        onAdminClick={() => setIsAdminOpen(!isAdminOpen)}
      />

      <main>
        {/* Parallax Hero Section - Height defines the scroll duration */}
        <div className="scroll-container relative h-[400vh]">
          <div className="parallax-sticky sticky top-0 h-screen w-full overflow-hidden">
            <Hero
              dish={currentDish}
              index={currentDishIndex + 1}
              total={dishes.length}
              onNext={handleNextDish}
              onPrev={handlePrevDish}
              scrollProgress={scrollProgress}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* Content Sections */}
        <Sections isDarkMode={isDarkMode} themeColor={currentDish.themeColor} />
      </main>

      <footer className="bg-black text-white pt-32 pb-16 px-8 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="space-y-8">
            <h2 className="text-4xl font-black tracking-tighter italic">CAFE DA VINA</h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Redefining the digital culinary landscape through high-fidelity visual storytelling and Michelin-grade ingredients.
            </p>
          </div>
          <div>
            <h3 className="font-black mb-8 uppercase tracking-[0.3em] text-[10px] text-zinc-500">Curations</h3>
            <ul className="space-y-4 text-sm font-medium text-zinc-400">
              <li><a href="#product" className="hover:text-white transition-colors">The Product</a></li>
              <li><a href="#ingredients" className="hover:text-white transition-colors">Core Elements</a></li>
              <li><a href="#nutrition" className="hover:text-white transition-colors">Health Metrix</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Global Feedback</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-black mb-8 uppercase tracking-[0.3em] text-[10px] text-zinc-500">Corporate</h3>
            <ul className="space-y-4 text-sm font-medium text-zinc-400">
              <li><a href="#" className="hover:text-white transition-colors">Our Heritage</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Concierge</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Protocal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Taste</a></li>
            </ul>
          </div>
          <div className="space-y-8">
            <h3 className="font-black uppercase tracking-[0.3em] text-[10px] text-zinc-500">Connections</h3>
            <div className="flex space-x-8">
              <i className="fa-brands fa-x-twitter text-2xl cursor-pointer hover:text-zinc-400 transition-colors"></i>
              <i className="fa-brands fa-instagram text-2xl cursor-pointer hover:text-zinc-400 transition-colors"></i>
              <i className="fa-brands fa-facebook text-2xl cursor-pointer hover:text-zinc-400 transition-colors"></i>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-700">
          <span>&copy; {new Date().getFullYear()} Cafe Da Vina. All rights reserved.</span>
        </div>
      </footer>

      {isAdminOpen && (
        <AdminDashboard
          dishes={dishes}
          onUpdateDishes={setDishes}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
