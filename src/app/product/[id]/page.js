"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Plus, Info } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from '@/app/product/ProductDetail.module.css';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                if (!id) return;
                const docRef = doc(db, "menu_items", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (err) {
                console.error("Error fetching product:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className={styles.productPage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.productPage}>
                <div className={styles.container} style={{ textAlign: 'center', paddingTop: '15vh' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Product Not Found</h1>
                    <p style={{ opacity: 0.6, marginBottom: '2rem' }}>Sorry, the item you are looking for does not exist.</p>
                    <Link href="/" className="btn btn-primary">Return to Menu</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.productPage}>
            <div className={styles.container}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    <ArrowLeft size={18} />
                    Back to Menu
                </button>

                <div className={styles.productGrid}>
                    <motion.div
                        className={styles.imageWrapper}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <img src={product.image} alt={product.name} className={styles.productImage} />
                    </motion.div>

                    <div className={styles.content}>
                        <motion.span
                            className={styles.category}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {product.category || "Menu Item"}
                        </motion.span>

                        <motion.h1
                            className={styles.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {product.name}
                        </motion.h1>

                        <motion.div
                            className={styles.price}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            {product.price}
                        </motion.div>

                        <motion.p
                            className={styles.description}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            {product.description}
                        </motion.p>

                        <motion.div
                            className={styles.actions}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Link href="/booking" className="btn btn-primary" style={{ padding: '16px 32px' }}>
                                <ShoppingBag size={20} style={{ marginRight: '8px' }} />
                                Order Now
                            </Link>
                        </motion.div>

                        <div className={styles.infoTabs}>
                            <div className={styles.tabHeader}>
                                <button
                                    className={`${styles.tabBtn} ${activeTab === 'description' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('description')}
                                >
                                    Description
                                </button>
                                <button
                                    className={`${styles.tabBtn} ${activeTab === 'nutrition' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('nutrition')}
                                >
                                    Nutrition
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'description' ? (
                                    <motion.div
                                        key="desc"
                                        className={styles.tabContent}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                    >
                                        <p>Crafted with secret ingredients and the finest selection of local products. Our {product.name} represents the perfect balance of flavor and presentation.</p>
                                        <ul>
                                            <li>100% Organic & Fresh</li>
                                            <li>Chef's Special Recommendation</li>
                                            <li>Available for Dine-in & Takeaway</li>
                                        </ul>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="nutr"
                                        className={styles.tabContent}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                    >
                                        <div className={styles.nutritionGrid}>
                                            <div className={styles.nutritionItem}>
                                                <span className={styles.nutritionVal}>320</span>
                                                <span className={styles.nutritionLabel}>Calories</span>
                                            </div>
                                            <div className={styles.nutritionItem}>
                                                <span className={styles.nutritionVal}>12g</span>
                                                <span className={styles.nutritionLabel}>Sugar</span>
                                            </div>
                                            <div className={styles.nutritionItem}>
                                                <span className={styles.nutritionVal}>8g</span>
                                                <span className={styles.nutritionLabel}>Protein</span>
                                            </div>
                                            <div className={styles.nutritionItem}>
                                                <span className={styles.nutritionVal}>0mg</span>
                                                <span className={styles.nutritionLabel}>Caffeine</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
