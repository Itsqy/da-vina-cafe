"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Instagram, Facebook, Twitter, ChevronUp, ChevronDown,
  Leaf, Info, MessageSquare, HelpCircle, Mail, MapPin, Phone
} from 'lucide-react';
import styles from './Home.module.css';
import ScrollWebPPlayer from '@/components/ScrollWebPPlayer';
import LoadingOverlay from '@/components/LoadingOverlay';
import Navbar from '@/components/Navbar';

const DISH_VARIANTS = [
  {
    id: 1,
    name: "Salmon Avocado",
    subtitle: "FRESH & HEALTHY",
    description: "A delicious blend of rich salmon and creamy avocado, served with a light citrus dressing.",
    themeColor: "#8b5e3c",
    sequencePath: "/avocado-salmon-frame/frame_",
    frameCount: 147
  },
  {
    id: 2,
    name: "Grilled Tuna",
    subtitle: "LIGHT & SMOKY",
    description: "Perfectly grilled tuna, served with fresh greens and a smoky dressing.",
    themeColor: "#2a9d8f",
    sequencePath: "/avocado-salmon-frame/frame_",
    frameCount: 147
  },
  {
    id: 3,
    name: "Mediterranean Salad",
    subtitle: "FRESH & ZESTY",
    description: "A refreshing salad of mixed greens, tomatoes, olives, and feta cheese with a zesty vinaigrette.",
    themeColor: "#e9c46a",
    sequencePath: "/avocado-salmon-frame/frame_",
    frameCount: 147
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSwitching, setIsSwitching] = useState(false);

  const heroContainerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroContainerRef,
    offset: ["start start", "end end"]
  });

  // Fade out hero content near the end of the scroll container
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const currentDish = DISH_VARIANTS[currentIndex];

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', currentDish.themeColor);
  }, [currentDish]);

  const handleNext = () => {
    setIsSwitching(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % DISH_VARIANTS.length);
      setIsSwitching(false);
    }, 500);
  };

  const handlePrev = () => {
    setIsSwitching(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + DISH_VARIANTS.length) % DISH_VARIANTS.length);
      setIsSwitching(false);
    }, 500);
  };

  const handleLoadingProgress = (progress) => {
    setLoadingProgress(progress);
    if (progress >= 100) {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  return (
    <div className={styles.page}>
      <AnimatePresence>
        {isLoading && (
          <LoadingOverlay progress={loadingProgress} visible={isLoading} />
        )}
      </AnimatePresence>

      <Navbar />

      <main>
        {/* Parallax Hero Wrapper - This handles the scroll duration for frames */}
        <div ref={heroContainerRef} className={styles.heroScrollWrapper}>
          <section className={styles.hero}>
            <ScrollWebPPlayer
              key={currentDish.sequencePath}
              sequencePath={currentDish.sequencePath}
              frameCount={currentDish.frameCount}
              onProgress={handleLoadingProgress}
              containerRef={heroContainerRef}
            />

            <motion.div
              style={{ opacity: heroOpacity, scale: heroScale }}
              className={`container ${styles.heroGrid}`}
            >
              {/* Left Content */}
              <div className={styles.heroLeft}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDish.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <h1 className={styles.dishName}>{currentDish.name}</h1>
                    <span className={styles.dishSubtitle}>{currentDish.subtitle}</span>
                    <p className={styles.dishDescription}>{currentDish.description}</p>

                    <div className={styles.heroActions}>
                      <Link href="#menu" className="btn btn-outline">See Menu</Link>
                      <Link href="/booking" className="btn btn-primary">Order Now</Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Center Area (Empty for visual) */}
              <div className={styles.heroCenter}></div>

              {/* Right Navigation */}
              <div className={styles.heroRight}>
                <div className={styles.dishIndex}>
                  0{currentIndex + 1}
                </div>

                <div className={styles.variantNav}>
                  <button onClick={handlePrev} className={styles.navBtn}>
                    <span className={styles.navLabel}>PREV</span>
                    <ChevronUp size={24} />
                  </button>
                  <div className={styles.navDivider}></div>
                  <button onClick={handleNext} className={styles.navBtn}>
                    <ChevronDown size={24} />
                    <span className={styles.navLabel}>NEXT</span>
                  </button>
                </div>

                {isSwitching && (
                  <div className={styles.miniLoader}>
                    <div className={styles.spinner}></div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Social Icons (Bottom Center) */}
            <motion.div
              style={{ opacity: heroOpacity }}
              className={styles.heroSocials}
            >
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><Instagram size={20} /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><Facebook size={20} /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><Twitter size={20} /></a>
            </motion.div>
          </section>
        </div>

        {/* Menu Section */}
        <section id="menu" className={styles.contentSection}>
          <div className="container">
            <div className={styles.sectionHeading}>
              <span>Discover</span>
              <h2>Menu / About the Dish</h2>
            </div>
            <div className={styles.menuGrid}>
              <div className={styles.menuContent}>
                <h3>Culinary Inspiration</h3>
                <p>Our {currentDish.name} is inspired by the vibrant flavors of the Mediterranean. Every ingredient is carefully selected for its freshness and nutritional value.</p>
                <ul className={styles.featureList}>
                  <li><Leaf size={18} /> Freshly Sourced Ingredients</li>
                  <li><Leaf size={18} /> Authentic Mediterranean Spices</li>
                  <li><Leaf size={18} /> Chef-Crafted Recipes</li>
                </ul>
              </div>
              <div className={styles.menuImage}>
                <img src="/egg-on-salmon.webp" alt="Menu item" />
              </div>
            </div>
          </div>
        </section>

        {/* Ingredients Section */}
        <section id="ingredients" className={`${styles.contentSection} ${styles.altBg}`}>
          <div className="container">
            <div className={styles.sectionHeading}>
              <span>Wholesome</span>
              <h2>Ingredients & Benefits</h2>
            </div>
            <div className={styles.ingredientsGrid}>
              {[
                { name: 'Salmon', benefit: 'Rich in Omega-3 fatty acids for heart health.' },
                { name: 'Avocado', benefit: 'Healthy fats and fiber for sustained energy.' },
                { name: 'Citrus', benefit: 'High in Vitamin C to boost immunity.' },
                { name: 'Herbs', benefit: 'Natural antioxidants and deep flavor.' }
              ].map((item, i) => (
                <div key={i} className={styles.ingredientCard}>
                  <div className={styles.ingredientIcon}><Leaf /></div>
                  <h4>{item.name}</h4>
                  <p>{item.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nutrition Section */}
        <section id="nutrition" className={styles.contentSection}>
          <div className="container">
            <div className={styles.nutritionLayout}>
              <div className={styles.nutritionLabel}>
                <h3>Nutrition Facts</h3>
                <div className={styles.labelDivider}></div>
                <div className={styles.labelItem}><span>Calories</span> <span>450</span></div>
                <div className={styles.labelItem}><span>Total Fat</span> <span>22g</span></div>
                <div className={styles.labelItem}><span>Protein</span> <span>35g</span></div>
                <div className={styles.labelItem}><span>Carbs</span> <span>12g</span></div>
                <div className={styles.labelItem}><span>Fiber</span> <span>8g</span></div>
              </div>
              <div className={styles.nutritionIntro}>
                <h2>Healthy & Balanced</h2>
                <p>We believe that food should not only taste good but also feel good. Each serving is designed to provide a balanced macro-nutrient profile.</p>
                <Link href="/booking" className="btn btn-primary">Book Now</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className={`${styles.contentSection} ${styles.altBg}`}>
          <div className="container">
            <div className={styles.sectionHeading}>
              <span>Voices</span>
              <h2>Wall of Love</h2>
            </div>
            <div className={styles.reviewsGrid}>
              {[1, 2, 3].map(i => (
                <div key={i} className={styles.reviewCard}>
                  <MessageSquare className={styles.reviewIcon} />
                  <p>"Absolutely stunning experience! The parallax effects are cool, but the food is even better. The {currentDish.name} is a must-try."</p>
                  <div className={styles.reviewer}>
                    <strong>John Doe</strong>
                    <span>Food Critic</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className={styles.contentSection}>
          <div className="container">
            <div className={styles.sectionHeading}>
              <span>Questions</span>
              <h2>Common Inquiries</h2>
            </div>
            <div className={styles.faqList}>
              {[
                { q: "Is the salmon wild-caught?", a: "Yes, we source all our salmon sustainably from local fisheries." },
                { q: "Do you have gluten-free options?", a: "Most of our dishes can be prepared gluten-free upon request." },
                { q: "Can I book a private event?", a: "Absolutely! Please contact us via phone or email for inquiries." }
              ].map((item, i) => (
                <div key={i} className={styles.faqItem}>
                  <div className={styles.faqHeader}>
                    <h4>{item.q}</h4>
                    <HelpCircle size={20} />
                  </div>
                  <p className={styles.faqAnswer}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="contact" className={styles.ctaSection}>
          <div className="container text-center">
            <h2>Ready for an unforgettable meal?</h2>
            <p>Join us at Cafe Da Vina for a modern fusion expereince.</p>
            <div className={styles.ctaButtons}>
              <Link href="/booking" className="btn btn-primary">Book a Table Now</Link>
              <a href="tel:+1234567890" className="btn btn-outline">Call Us</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className="container">
            <div className={styles.footerGrid}>
              <div className={styles.footerBrand}>
                <h3>Cafe Da Vina</h3>
                <p>Modern Fusion Café</p>
                <div className={styles.footerSocials}>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><Instagram size={20} /></a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><Facebook size={20} /></a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><Twitter size={20} /></a>
                </div>
              </div>
              <div className={styles.footerLinks}>
                <h4>Quick Links</h4>
                <Link href="#menu">Menu</Link>
                <Link href="#ingredients">Ingredients</Link>
                <Link href="#reviews">Reviews</Link>
              </div>
              <div className={styles.footerContact}>
                <h4>Contact</h4>
                <p><MapPin size={16} /> 123 Gourmet St, Food City</p>
                <p><Phone size={16} /> +1 234 567 890</p>
                <p><Mail size={16} /> hello@cafedavina.com</p>
              </div>
            </div>
            <div className={styles.footerBottom}>
              <p>&copy; 2026 Cafe Da Vina. All rights reserved.</p>
              <div className={styles.footerLegal}>
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms of Service</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
