"use client";
import { motion } from 'framer-motion';
import styles from './Menu.module.css';

const menuItems = [
    {
        id: 1,
        name: 'Eggs on Salmon',
        description: 'Freshly poached eggs served on premium smoked salmon and toasted sourdough bread.',
        price: '$18.50',
        image: '/egg-on-salmon.webp',
        category: 'Breakfast'
    },
    {
        id: 2,
        name: 'Avocado Salmon',
        description: 'Grilled salmon fillet accompanied by creamy avocado slices and a light citrus salad.',
        price: '$21.00',
        image: '/avvocado-salmon.webp',
        category: 'Lunch'
    },
    {
        id: 3,
        name: 'Ham and Toast',
        description: 'Thick slices of honey-glazed ham served with artisan sourdough toast and homemade jam.',
        price: '$15.50',
        image: '/toast-and-ham.webp',
        category: 'Breakfast'
    },
    {
        id: 4,
        name: 'Smashed Avocado',
        description: 'Our signature smashed avocado on sourdough, topped with feta, radish, and a hint of chili.',
        price: '$16.50',
        image: '/smashed-avocado.jpg',
        category: 'Breakfast'
    }
];

export default function MenuPage() {
    return (
        <div className={styles.menuPage}>
            <section className={styles.headerSection}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.headerContent}
                    >
                        <h1>Our Menu</h1>
                        <p>Carefully curated dishes to satisfy your cravings, made with love and fresh ingredients.</p>
                    </motion.div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className={styles.menuGrid}>
                        {menuItems.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={styles.menuCard}
                            >
                                <div className={styles.imageWrapper}>
                                    <img src={item.image} alt={item.name} />
                                    <span className={styles.category}>{item.category}</span>
                                </div>
                                <div className={styles.cardContent}>
                                    <div className={styles.namePrice}>
                                        <h3>{item.name}</h3>
                                        <span className={styles.price}>{item.price}</span>
                                    </div>
                                    <p>{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
