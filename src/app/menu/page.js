"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import styles from './Menu.module.css';

const DEFAULT_MENU = [
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
    }
];

export default function MenuPage() {
    const [menuItems, setMenuItems] = useState(DEFAULT_MENU);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "menu_items"));
                if (!querySnapshot.empty) {
                    setMenuItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
            } catch (err) {
                console.error("Error fetching menu:", err);
            }
        };
        fetchMenu();
    }, []);

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

