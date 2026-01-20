
import React, { useState, useEffect } from 'react';

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  themeColor: string;
  onAdminClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleTheme, themeColor, onAdminClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('product');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const sections = ['product', 'ingredients', 'nutrition', 'reviews', 'faq', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 200) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Product', id: 'product' },
    { label: 'Ingredients', id: 'ingredients' },
    { label: 'Nutrition', id: 'nutrition' },
    { label: 'Reviews', id: 'reviews' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Contact', id: 'contact' },
  ];

  const textColor = isDarkMode ? 'text-white' : 'text-zinc-900';
  const bgColor = isScrolled 
    ? (isDarkMode ? 'bg-black/80' : 'bg-white/80') 
    : 'bg-transparent';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-md px-8 py-4 ${bgColor} ${textColor} flex justify-between items-center`}>
      <div className="flex items-center space-x-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span className="text-xl font-black tracking-tighter">CAFE DA VINA</span>
      </div>

      <div className="hidden md:flex space-x-8 uppercase tracking-widest text-[10px] font-bold">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`hover:opacity-100 transition-opacity ${activeSection === item.id ? 'opacity-100' : 'opacity-40'}`}
            style={{ color: activeSection === item.id ? themeColor : undefined }}
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="flex items-center space-x-6">
        <button 
          onClick={onAdminClick} 
          className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition"
        >
          Admin
        </button>
        <button onClick={toggleTheme} className="hover:scale-110 transition-transform">
          <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
