"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Coffee, ArrowRight, ChevronRight, Wifi, Armchair, Sun,
  Instagram, Facebook, Twitter, MapPin, Clock, Phone
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import styles from './Home.module.css';

const DEFAULT_MENU = [
  {
    id: 'item-1',
    name: 'Signature Latte',
    description: 'Rich espresso with perfectly steamed milk and a touch of vanilla bean.',
    price: '$4.50',
    image: 'https://storage.googleapis.com/banani-generated-images/generated-images/01b06483-8231-475b-a470-569a2f9ca68b.jpg',
    category: 'Coffee'
  },
  {
    id: 'item-2',
    name: 'Butter Croissant',
    description: 'Freshly baked every morning, flaky, golden, and impossibly buttery.',
    price: '$3.75',
    image: 'https://storage.googleapis.com/banani-generated-images/generated-images/f7ef4c93-bcdb-47de-8586-bd0389510ac1.jpg',
    category: 'Bakery'
  },
  {
    id: 'item-3',
    name: "Davina's Toast",
    description: 'Sourdough topped with smashed avocado, poached egg, and chili flakes.',
    price: '$8.50',
    image: 'https://storage.googleapis.com/banani-generated-images/generated-images/516bd49b-a595-49eb-b462-f5e0ab2d8c2e.jpg',
    category: 'Food'
  },
  {
    id: 'item-4',
    name: 'Iced Matcha',
    description: 'Premium ceremonial grade matcha whisked with oat milk and ice.',
    price: '$5.00',
    image: 'https://storage.googleapis.com/banani-generated-images/generated-images/fb04e085-47a1-422b-a170-78323520f01c.jpg',
    category: 'Non Coffee'
  }
];

const DEFAULT_CONFIG = {
  welcome: "A Warm Welcome in Every Cup",
  phone: "+62 812 3456 7890",
  hours: "Mon–Fri 08:00–22:00",
  address: "Jl. Kopi Harapan No. 12, Jakarta",
  email: "halo@cafedavina.com",
  heroImage: "https://storage.googleapis.com/banani-generated-images/generated-images/de63915b-8f34-47fe-bddd-6e1f90159747.jpg",
  heroSubtitle: "Experience the coziest corner in town. Hand-crafted coffee, fresh pastries, and a space designed for connection.",
  storyImage: "https://storage.googleapis.com/banani-generated-images/generated-images/a604cbb0-d28f-4f46-ba64-3d4df5bce336.jpg",
  experienceImage: "https://storage.googleapis.com/banani-generated-images/generated-images/aa22fa01-567b-402e-ad9e-cde85b3da042.jpg"
};

export default function Home() {
  const [menuItems, setMenuItems] = useState(DEFAULT_MENU);
  const [siteConfig, setSiteConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const menuSnap = await getDocs(collection(db, "menu_items"));
        if (!menuSnap.empty) {
          setMenuItems(menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }

        const configSnap = await getDoc(doc(db, "settings", "global"));
        if (configSnap.exists()) {
          setSiteConfig(configSnap.data());
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={styles.loadingLogo}
        >
          <div className={styles.loaderPulse}></div>
          <Coffee size={48} className={styles.loaderIcon} />
        </motion.div>
        <p className={styles.loadingText}>Brewing Experience...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <img
            src={siteConfig.heroImage || "https://storage.googleapis.com/banani-generated-images/generated-images/de63915b-8f34-47fe-bddd-6e1f90159747.jpg"}
            className={styles.heroBg}
            alt="Cozy cafe interior"
          />
          <div className={styles.heroOverlay}></div>
          <div className="container">
            <motion.div
              className={styles.heroContent}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className={styles.heroTitle}>
                {siteConfig.welcome || "A Warm Welcome in Every Cup"}
              </h1>
              <p className={styles.heroSubtitle}>
                {siteConfig.heroSubtitle || "Experience the coziest corner in town. Hand-crafted coffee, fresh pastries, and a space designed for connection."}
              </p>
              <Link href="#menu" className="btn btn-primary">
                View Our Menu <ArrowRight size={20} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="section">
          <div className="container">
            <div className="grid-2">
              <motion.div
                className={styles.textContent}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h3>More Than Just Coffee</h3>
                <p>
                  At Cafe Davina, we believe that a coffee shop should be an extension of your living room. A place where the lighting is always warm, the seats are always comfortable, and the smiles are genuine.
                </p>
                <p>
                  Whether you're looking for a quiet spot to focus on your work, or a vibrant space to catch up with old friends, we've crafted our environment to suit your every mood. Come for the coffee, stay for the feeling.
                </p>
                <Link href="/about" className={styles.btnText}>
                  Read Our Story <ChevronRight size={20} />
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <img
                  src={siteConfig.storyImage || "https://storage.googleapis.com/banani-generated-images/generated-images/a604cbb0-d28f-4f46-ba64-3d4df5bce336.jpg"}
                  className={styles.storyImg}
                  alt="Friends at Cafe Davina"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Menu/Favorites Section */}
        <section id="menu" className="section section-alt">
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Customer Favorites</h2>
              <p className={styles.sectionDesc}>
                Handpicked selections from our seasonal menu, crafted with love and premium ingredients.
              </p>
            </div>
            <div className="grid-4">
              {menuItems.slice(0, 4).map((item, idx) => (
                <motion.div
                  key={item.id}
                  className={styles.menuCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <img src={item.image} className={styles.menuImg} alt={item.name} />
                  <div className={styles.menuContent}>
                    <div className={styles.menuHeader}>
                      <div className={styles.menuTitle}>{item.name}</div>
                      <div className={styles.menuPrice}>{item.price}</div>
                    </div>
                    <p className={styles.menuDesc}>{item.description}</p>
                    <Link href={`/product/${item.id}`} className={styles.btnText}>Order Now</Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Space/Experience Section */}
        <section className="section">
          <div className="container">
            <div className="grid-2" style={{ direction: 'rtl' }}>
              <motion.div
                className={styles.textContent}
                style={{ direction: 'ltr' }}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h3>Space for Every Moment</h3>
                <p>
                  Whether you need a change of scenery for your workday or a cozy nook to unwind with a book, our space adapts to you. With plenty of power outlets, high-speed WiFi, and softer zones for relaxation, Cafe Davina is your home away from home.
                </p>
                <div className={styles.featuresList}>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}><Wifi size={24} /></div>
                    <span>Fast WiFi</span>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}><Armchair size={24} /></div>
                    <span>Cozy Seating</span>
                  </div>
                  <div className={styles.featureItem}>
                    <div className={styles.featureIcon}><Sun size={24} /></div>
                    <span>Warm Vibes</span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                style={{ direction: 'ltr' }}
              >
                <img
                  src={siteConfig.experienceImage || "https://storage.googleapis.com/banani-generated-images/generated-images/aa22fa01-567b-402e-ad9e-cde85b3da042.jpg"}
                  className={styles.storyImg}
                  alt="Workspace at Davina"
                />
              </motion.div>
            </div>
          </div>
        </section>
        {/* Visit/Contact Section */}
        <section id="location" className="section">
          <div className="container">
            <div className={styles.visitContainer}>
              <div className={styles.visitInfo}>
                <h2 className={styles.visitTitle}>Come say hello.</h2>
                <div className={styles.visitList}>
                  <div className={styles.visitItem}>
                    <div className={styles.visitIcon}><MapPin size={24} /></div>
                    <div className={styles.visitText}>
                      <h4>Address</h4>
                      <p>{siteConfig.address}</p>
                    </div>
                  </div>
                  <div className={styles.visitItem}>
                    <div className={styles.visitIcon}><Clock size={24} /></div>
                    <div className={styles.visitText}>
                      <h4>Opening Hours</h4>
                      <p>{siteConfig.hours}</p>
                    </div>
                  </div>
                  <div className={styles.visitItem}>
                    <div className={styles.visitIcon}><Phone size={24} /></div>
                    <div className={styles.visitText}>
                      <h4>Contact</h4>
                      <p>{siteConfig.phone}<br />{siteConfig.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.visitMap}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.2335447600887!2d153.02535031505304!3d-27.46194798332159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b915a034909a349%3A0xe5a363a0a3826038!2s107%20Astor%20Terrace%2C%20Spring%20Hill%20QLD%204000%2C%20Australia!5e0!3m2!1sen!2sid!4v1643257000000!5m2!1sen!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
