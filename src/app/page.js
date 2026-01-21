"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChefHat, Utensils, Heart, Calendar } from 'lucide-react';
import styles from './Home.module.css';

export default function Home() {
  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`${styles.container} container`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.heroContent}
          >
            <span className={styles.subtitle}>Welcome to Cafe Da-Vina</span>
            <h1>Where Every Meal Feels Like Home</h1>
            <p>
              A lovely place for a delightful meal, serving comforting and tasty food in a cozy and inviting environment. Perfect for eggs on salmon, avocado salmon, and more.
            </p>
            <div className={styles.cta}>
              <Link href="/booking" className="btn btn-primary">Make a Reservation</Link>
              <Link href="/menu" className="btn btn-outline">Explore Menu</Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={styles.heroImage}
          >
            <div className={styles.imagePlaceholder}>
              <img src="/egg-on-salmon.webp" alt="Cafe Interior" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className={`${styles.intro} section`}>
        <div className="container">
          <div className={styles.introGrid}>
            <div className={styles.introCard}>
              <Heart className={styles.icon} size={40} />
              <h3>Warm Ambiance</h3>
              <p>Experience the charm of our cozy space, designed to make you feel right at home.</p>
            </div>
            <div className={styles.introCard}>
              <Utensils className={styles.icon} size={40} />
              <h3>Fresh Food</h3>
              <p>Delight in our carefully crafted meals made with the freshest local ingredients.</p>
            </div>
            <div className={styles.introCard}>
              <ChefHat className={styles.icon} size={40} />
              <h3>Lovely Service</h3>
              <p>Our friendly team is here to ensure your visit is nothing short of wonderful.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className={`${styles.featured} section`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span>Our Specialties</span>
            <h2>Chef's Recommendations</h2>
          </div>
          <div className={styles.featuredGrid}>
            {[
              { name: 'Eggs on Salmon', img: '/egg-on-salmon.webp' },
              { name: 'Avocado Salmon', img: '/avvocado-salmon.webp' },
              { name: 'Smashed Avocado', img: '/smashed-avocado.jpg' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className={styles.featuredItem}
              >
                <img src={item.img} alt={item.name} />
                <div className={styles.itemInfo}>
                  <h3>{item.name}</h3>
                  <Link href="/menu" className={styles.link}>View Details</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className={styles.reservationCta}>
        <div className="container">
          <div className={styles.ctaBox}>
            <h2>Ready to join us?</h2>
            <p>Book your cozy table today and experience the warmth of Cafe Da-Vina.</p>
            <Link href="/booking" className="btn btn-primary">
              <Calendar size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
              Book Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
