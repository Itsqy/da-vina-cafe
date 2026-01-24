"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Plus, Minus, Info, ClipboardList } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '../ProductDetail.module.css';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Ensure ID is valid before fetching
                if (!id) return;

                const docRef = doc(db, "menu_items", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log("No such product found in Firestore!");
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
                <div className="spinner"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.productPage}>
                <Navbar />
                <div className={styles.container} style={{ textAlign: 'center', paddingTop: '15vh' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Product Not Found</h1>
                    <p style={{ opacity: 0.6, marginBottom: '2rem' }}>Sorry, the item you are looking for does not exist or has been removed.</p>
                    <Link href="/" className="btn btn-primary">Return to Menu</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.productPage}>
            <Navbar />

            <div className={styles.container}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    <ArrowLeft size={18} />
                    Back to Menu
                </button>

                <div className={styles.productGrid}>
                    <motion.div
                        className={styles.imageWrapper}
                        initial={{ opacity: 0, scale: 0.9 }}
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
                            <Link href="/booking" className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <ShoppingBag size={20} />
                                Order Now
                            </Link>
                            <button className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Plus size={20} />
                                Add to Wishlist
                            </button>
                        </motion.div>

                        <div className={styles.infoTabs}>
                            <div className={styles.tabHeader}>
                                <button
                                    className={`${styles.tabBtn} ${activeTab === 'description' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('description')}
                                >
                                    Details
                                </button>
                                <button
                                    className={`${styles.tabBtn} ${activeTab === 'ingredients' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('ingredients')}
                                >
                                    Ingredients
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
                                        <p>Our {product.name} is crafted with the finest ingredients and prepared fresh daily. Perfect for a {(product.category || 'meal').toLowerCase()} break.</p>
                                        <ul style={{ marginTop: '1rem', listStyle: 'disc', paddingLeft: '1.2rem' }}>
                                            <li>Freshly Sourced Premium Quality</li>
                                            <li>Artisanal Preparation</li>
                                            <li>Healthy & Nutritious</li>
                                        </ul>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="ingr"
                                        className={styles.tabContent}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                    >
                                        <div className={styles.nutritionGrid}>
                                            <div className={styles.nutritionItem}>
                                                <span className={styles.nutritionVal}>450</span>
                                                <span className={styles.nutritionLabel}>Calories</span>
                                            </div>
                                            <div className={styles.nutritionItem}>
                                                <span className={styles.nutritionVal}>35g</span>
                                                <span className={styles.nutritionLabel}>Protein</span>
                                            </div>
                                            <div className={styles.nutritionItem}>
                                                <span className={styles.nutritionVal}>22g</span>
                                                <span className={styles.nutritionLabel}>Fat</span>
                                            </div>
                                            <div className={styles.nutritionItem}>
                                                <span className={styles.nutritionVal}>12g</span>
                                                <span className={styles.nutritionLabel}>Carbs</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
