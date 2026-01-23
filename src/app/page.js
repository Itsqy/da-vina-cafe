"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Instagram, Facebook, Twitter, ChevronUp, ChevronDown,
  Leaf, Info, MessageSquare, HelpCircle, Mail, MapPin, Phone, Clock
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import styles from './Home.module.css';
import ScrollWebPPlayer from '@/components/ScrollWebPPlayer';
import LoadingOverlay from '@/components/LoadingOverlay';
import Navbar from '@/components/Navbar';

const DEFAULT_DISHES = [
  {
    id: 'salmon-avocado',
    name: "Salmon Avocado",
    subtitle: "FRESH & HEALTHY",
    description: "A delicious blend of rich salmon and creamy avocado, served with a light citrus dressing.",
    themeColor: "#8b5e3c",
    sequencePath: "/avocado-salmon-frame/frame_",
    frameCount: 88
  },
  {
    id: 'grilled-tuna',
    name: "Grilled Tuna",
    subtitle: "LIGHT & SMOKY",
    description: "Perfectly grilled tuna, served with fresh greens and a smoky dressing.",
    themeColor: "#2a9d8f",
    sequencePath: "/avocado-salmon-frame/frame_",
    frameCount: 88
  },
  {
    id: 'mediterranean-salad',
    name: "Mediterranean Salad",
    subtitle: "FRESH & ZESTY",
    description: "A refreshing salad of mixed greens, tomatoes, olives, and feta cheese with a zesty vinaigrette.",
    themeColor: "#e9c46a",
    sequencePath: "/avocado-salmon-frame/frame_",
    frameCount: 88
  }
];

const DEFAULT_MENU = [
  {
    id: 'item-1',
    name: 'Eggs on Salmon',
    description: 'Freshly poached eggs served on premium smoked salmon and toasted sourdough bread.',
    price: '$18.50',
    image: '/egg-on-salmon.webp',
    category: 'Breakfast'
  },
  {
    id: 'item-2',
    name: 'Avocado Salmon',
    description: 'Grilled salmon fillet accompanied by creamy avocado slices and a light citrus salad.',
    price: '$21.00',
    image: '/avvocado-salmon.webp',
    category: 'Lunch'
  },
  {
    id: 'item-3',
    name: 'Ham and Toast',
    description: 'Thick slices of honey-glazed ham served with artisan sourdough toast and homemade jam.',
    price: '$15.50',
    image: '/toast-and-ham.webp',
    category: 'Breakfast'
  },
  {
    id: 'item-4',
    name: 'Smashed Avocado',
    description: 'Our signature smashed avocado on sourdough, topped with feta, radish, and a hint of chili.',
    price: '$16.50',
    image: '/smashed-avocado.jpg',
    category: 'Breakfast'
  }
];

const DEFAULT_CONFIG = {
  heroTitle: "Ready for an unforgettable meal?",
  heroDescription: "Join us at Cafe Da Vina for a modern fusion experience.",
  address: "123 Gourmet St, Food City",
  phone: "+1 234 567 890",
  email: "hello@cafedavina.com",
  isOpen: true
};

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSwitching, setIsSwitching] = useState(false);

  // Firestore Data
  const [dishes, setDishes] = useState(DEFAULT_DISHES);
  const [menuItems, setMenuItems] = useState(DEFAULT_MENU);
  const [siteConfig, setSiteConfig] = useState(DEFAULT_CONFIG);

  const heroContainerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroContainerRef,
    offset: ["start start", "end end"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const currentDish = dishes[currentIndex] || DEFAULT_DISHES[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Dishes
        const dishesSnap = await getDocs(collection(db, "dishes"));
        if (!dishesSnap.empty) {
          setDishes(dishesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }

        // Fetch Menu Items
        const menuSnap = await getDocs(collection(db, "menu_items"));
        setMenuItems(menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Site Config
        const configSnap = await getDoc(doc(db, "configs", "site"));
        if (configSnap.exists()) {
          setSiteConfig(configSnap.data());
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (currentDish) {
      document.documentElement.style.setProperty('--accent-color', currentDish.themeColor);
    }
  }, [currentDish]);

  // Simulate loading for the video (since we don't have individual frame progress anymore)
  // Handle WebP Loading Progress
  const handleLoadingProgress = (progress) => {
    setLoadingProgress(progress);
    // Optimization: Open the site as soon as the critical frames (35%) are ready.
    // The rest will load smoothly in the background while the user explores.
    if (progress >= 35) {
      setTimeout(() => setIsLoading(false), 500);
    }
  };


  const handleNext = () => {
    setIsSwitching(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % dishes.length);
      setIsSwitching(false);
    }, 500);
  };

  const handlePrev = () => {
    setIsSwitching(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + dishes.length) % dishes.length);
      setIsSwitching(false);
    }, 500);
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
        <div ref={heroContainerRef} className={styles.heroScrollWrapper}>
          <section className={styles.hero}>
            <ScrollWebPPlayer
              key={currentDish?.sequencePath || 'fallback'}
              sequencePath={currentDish?.sequencePath || DEFAULT_DISHES[0].sequencePath}
              frameCount={currentDish?.frameCount || DEFAULT_DISHES[0].frameCount}
              onProgress={handleLoadingProgress}
              containerRef={heroContainerRef}
            />

            <motion.div
              style={{ opacity: heroOpacity, scale: heroScale }}
              className={`container ${styles.heroGrid}`}
            >
              <div className={styles.heroLeft}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDish?.id || 'empty'}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <h1 className={styles.dishName}>{currentDish?.name}</h1>
                    <span className={styles.dishSubtitle}>{currentDish?.subtitle}</span>
                    <p className={styles.dishDescription}>{currentDish?.description}</p>

                    <div className={styles.heroActions}>
                      <Link href="#menu" className="btn btn-outline">See Menu</Link>
                      <Link href="/booking" className="btn btn-primary">Order Now</Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className={styles.heroCenter}></div>

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

        {/* Featured Menu Cards Section */}
        <section id="menu" className={styles.contentSection}>
          <div className="container">
            <div className={styles.sectionHeading}>
              <span>Discover</span>
              <h2>Our Signature Selection</h2>
            </div>
            <div className={styles.featuredMenuGrid}>
              {menuItems.slice(0, 4).map((item, idx) => (
                <motion.div
                  key={item.id}
                  className={styles.menuFeatureCard}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className={styles.menuFeatureImage}>
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className={styles.menuFeatureContent}>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <span className={styles.menuFeaturePrice}>{item.price}</span>
                  </div>
                </motion.div>
              ))}
              {menuItems.length === 0 && (
                <p style={{ textAlign: 'center', gridColumn: '1/-1', opacity: 0.5 }}>No menu items configured yet.</p>
              )}
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
                  <p>"Absolutely stunning experience! The parallax effects are cool, but the food is even better."</p>
                  <div className={styles.reviewer}>
                    <strong>Satisfied Guest</strong>
                    <span>Food Lover</span>
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
            <h2>{siteConfig.heroTitle}</h2>
            <p>{siteConfig.heroDescription}</p>
            <div className={styles.ctaButtons}>
              <Link href="/booking" className="btn btn-primary">Book a Table Now</Link>
              <a href={`tel:${siteConfig.phone}`} className="btn btn-outline">Call Us</a>
            </div>
            <div className={`${styles.storeStatus} ${siteConfig.isOpen ? styles.open : styles.closed}`}>
              <Clock size={20} />
              <span>We are currently {siteConfig.isOpen ? 'OPEN' : 'CLOSED'}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
