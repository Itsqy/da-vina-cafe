
import React, { useState } from 'react';
import AppointmentForm from './AppointmentForm';

interface SectionsProps {
  isDarkMode: boolean;
  themeColor: string;
}

const FAQItem: React.FC<{ question: string; answer: string; isDarkMode: boolean }> = ({ question, answer, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`border-b ${isDarkMode ? 'border-white/10' : 'border-black/10'} mb-4 overflow-hidden`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex justify-between items-center text-left"
      >
        <span className="text-lg font-black tracking-tight uppercase">{question}</span>
        <div className={`w-6 h-6 rounded-full border border-current flex items-center justify-center transition-transform duration-500 ${isOpen ? 'rotate-45' : ''}`}>
          <i className="fa-solid fa-plus text-[10px]"></i>
        </div>
      </button>
      <div className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'max-h-64 pb-8 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
        <p className="text-base opacity-60 leading-relaxed max-w-2xl">{answer}</p>
      </div>
    </div>
  );
};

const Sections: React.FC<SectionsProps> = ({ isDarkMode, themeColor }) => {
  const [formData, setFormData] = useState({ name: '', email: '', guests: 2, date: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call to Firebase
    await new Promise(res => setTimeout(res, 1500));
    setSubmitted(true);
    setLoading(false);
    console.log("Reservation stored in Firebase (simulated):", formData);
  };

  const sectionClass = `py-40 px-8 transition-colors duration-700`;
  const containerClass = `max-w-7xl mx-auto`;
  const headingClass = `text-6xl md:text-[7rem] font-black tracking-tighter uppercase mb-20 leading-[0.85]`;

  return (
    <div className="relative z-10">
      {/* Product / About Section */}
      <section id="product" className={`${sectionClass} ${isDarkMode ? 'bg-zinc-950' : 'bg-white'}`}>
        <div className={`${containerClass} grid lg:grid-cols-2 gap-32 items-center`}>
          <div className="space-y-16">
            <div>
              <h2 className={headingClass}>Gourmet <br/><span style={{ color: themeColor }}>Pioneer</span></h2>
              <p className="text-2xl font-light opacity-70 leading-relaxed max-w-xl">
                We believe that dining is a visual performance. Cafe Da Vina blends the highest quality ingredients with a cinematic presentation that engages all senses.
              </p>
            </div>
            
            <div className="flex gap-16">
              <div className="space-y-4">
                <span className="text-5xl font-black block tracking-tighter">48h</span>
                <span className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">Marinade Process</span>
              </div>
              <div className="space-y-4">
                <span className="text-5xl font-black block tracking-tighter">100%</span>
                <span className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">Organic Origins</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div 
              className="relative aspect-square rounded-[4rem] overflow-hidden flex items-center justify-center group"
              style={{ backgroundColor: isDarkMode ? '#111' : '#f9f9f9' }}
            >
              <div 
                className="absolute inset-0 opacity-10 blur-[120px] group-hover:opacity-20 transition-opacity duration-1000"
                style={{ backgroundColor: themeColor }}
              ></div>
              <div className="relative z-10 w-[85%] h-[85%]">
                 <img 
                   src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80" 
                   alt="Gourmet Dish" 
                   className="w-full h-full object-cover rounded-[3rem] shadow-2xl transition-transform duration-1000 group-hover:scale-105"
                 />
                 <div 
                   className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full flex items-center justify-center text-black font-black text-center leading-none uppercase text-[10px] tracking-widest shadow-2xl"
                   style={{ backgroundColor: themeColor }}
                 >
                   Chef's Choice
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients & Benefits */}
      <section id="ingredients" className={`${sectionClass} ${isDarkMode ? 'bg-zinc-900' : 'bg-stone-50'}`}>
        <div className={containerClass}>
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-24">
             <h2 className={headingClass}>The <br/>Build</h2>
             <p className="max-w-xs text-sm opacity-50 font-medium tracking-wide uppercase italic">Every element chosen for maximum nutritional impact and flavor profile.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { title: 'Wild King Salmon', detail: 'Rich in Omega-3, pan-seared for a delicate crust.', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80' },
              { title: 'Hass Avocados', detail: 'Organic creamy texture, harvested at peak ripeness.', img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80' },
              { title: 'Microgreen Blend', detail: 'Locally grown sprouts for an earthy, fresh crunch.', img: 'https://images.unsplash.com/photo-1587334274328-64186a80aeee?auto=format&fit=crop&w=600&q=80' }
            ].map((item, idx) => (
              <div key={idx} className="group cursor-default">
                <div className="aspect-[3/4] overflow-hidden rounded-[2.5rem] mb-10 bg-black">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-100" />
                </div>
                <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter">{item.title}</h3>
                <p className="opacity-50 text-base leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nutrition Facts Label */}
      <section id="nutrition" className={`${sectionClass} ${isDarkMode ? 'bg-zinc-950' : 'bg-white'}`}>
        <div className={`${containerClass} flex flex-col lg:flex-row items-center gap-32`}>
          <div className="flex-1">
            <h2 className={headingClass}>Fuel <br/>Metrix</h2>
            <p className="text-2xl font-light opacity-60 mb-16 max-w-md">Absolute transparency. We measure every gram so you can enjoy every bite without hesitation.</p>
            <div className="space-y-8">
               {['Bio-Protein', 'Essential Fats', 'Dietary Fiber'].map(label => (
                 <div key={label} className="group">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] mb-4">
                       <span className="group-hover:translate-x-2 transition-transform duration-500">{label}</span>
                       <span style={{ color: themeColor }}>Optimal Range</span>
                    </div>
                    <div className="h-[1px] w-full bg-current opacity-10 relative">
                       <div className="absolute top-0 left-0 h-full w-[88%] transition-all duration-1000 delay-300" style={{ backgroundColor: themeColor }}></div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
          
          <div className={`w-full max-w-sm p-10 border-[16px] border-black ${isDarkMode ? 'bg-white text-black' : 'bg-white'}`}>
            <h3 className="text-6xl font-black border-b-[12px] border-black pb-4 mb-2 leading-none uppercase italic tracking-tighter">Nutrition</h3>
            <p className="font-bold border-b border-black py-2 text-sm tracking-tight">Serving Size 1 Platter (280g)</p>
            <div className="flex justify-between items-end border-b-[10px] border-black py-6">
              <p className="font-black text-4xl leading-none tracking-tighter">Calories</p>
              <p className="font-black text-7xl leading-none">420</p>
            </div>
            <div className="border-b border-black py-3 font-black flex justify-between text-base">
              <span>Total Fat 28g</span>
              <span>36%</span>
            </div>
            <div className="border-b border-black py-3 font-black flex justify-between text-base pl-6">
              <span className="font-bold">Saturated Fat 4g</span>
              <span>20%</span>
            </div>
            <div className="border-b border-black py-3 font-black flex justify-between text-base">
              <span>Sodium 380mg</span>
              <span>16%</span>
            </div>
            <div className="border-b-[12px] border-black py-3 font-black flex justify-between text-base">
              <span>Protein 34g</span>
              <span>68%</span>
            </div>
            <p className="text-[10px] mt-6 font-bold uppercase leading-tight italic opacity-60">Verified by Da Vina Labs 2024. Percent Daily Values are based on a 2,000 calorie diet.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={`${sectionClass} ${isDarkMode ? 'bg-zinc-900' : 'bg-stone-100'}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className={headingClass}>Intel</h2>
          <div className="space-y-4">
            <FAQItem 
              isDarkMode={isDarkMode}
              question="Origin of Salmon?" 
              answer="We use wild-caught King Salmon from the cold waters of Alaska, delivered fresh daily to our kitchens." 
            />
            <FAQItem 
              isDarkMode={isDarkMode}
              question="Can I order for events?" 
              answer="Yes, we offer catering services. Please contact our concierge via the reservation form for custom event menus." 
            />
            <FAQItem 
              isDarkMode={isDarkMode}
              question="Allergy Information?" 
              answer="Our facility handles nuts and seafood. While we take extreme care, cross-contamination is possible. Full allergen sheets available upon request." 
            />
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className={`${sectionClass} ${isDarkMode ? 'bg-zinc-950' : 'bg-white'}`}>
        <div className={containerClass}>
          <h2 className={`${headingClass} mb-32`}>Global <br/><span className="opacity-10 text-5xl">Feedback</span></h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
            {[
              { author: "Marcus Thorne", text: "The Avocado Salmon isn't just a meal; it's a statement. The precision in the seared crust is pure art.", role: "Lead Food Critic, Metro" },
              { author: "Elena Rossi", text: "Finally, a brand that cares as much about the environment as they do about the flavor. Incredible experience.", role: "Culinary Blogger" }
            ].map((rev, idx) => (
              <div key={idx} className="space-y-10 group">
                <div className="flex space-x-2">
                   {[1,2,3,4,5].map(s => <i key={s} className="fa-solid fa-star text-[10px]" style={{ color: themeColor }}></i>)}
                </div>
                <p className="text-4xl font-light italic leading-snug group-hover:opacity-100 opacity-80 transition-opacity">"{rev.text}"</p>
                <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 rounded-full bg-current opacity-5 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center font-black text-xl">{rev.author[0]}</div>
                   </div>
                   <div>
                     <p className="font-black text-xl uppercase tracking-tighter">{rev.author}</p>
                     <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30">{rev.role}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment / Contact */}
      <AppointmentForm />
    </div>
  );
};

export default Sections;
