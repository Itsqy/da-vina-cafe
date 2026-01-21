"use client";
import { motion } from 'framer-motion';
import styles from './Gallery.module.css';

const images = [
    '/egg-on-salmon.webp',
    '/avvocado-salmon.webp',
    '/smashed-avocado.jpg',
    '/toast-and-ham.webp',
    // Repeating for grid layout effect, or you can add more unique photos later
    '/egg-on-salmon.webp',
    '/avvocado-salmon.webp'
];

export default function GalleryPage() {
    return (
        <div className={styles.galleryPage}>
            <header className={styles.header}>
                <div className="container">
                    <h1>Our Gallery</h1>
                    <p>Capturing the cozy moments and delicious flavors of Cafe Da-Vina.</p>
                </div>
            </header>

            <section className="section">
                <div className="container">
                    <div className={styles.galleryGrid}>
                        {images.map((src, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                className={styles.galleryItem}
                            >
                                <img src={src} alt={`Cafe Gallery ${idx + 1}`} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
