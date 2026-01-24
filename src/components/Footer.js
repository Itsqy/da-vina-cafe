"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from './Footer.module.css';

export default function Footer() {
    const [config, setConfig] = useState({
        address: '107 Astor Terrace, Spring Hill QLD 4000',
        phone: '+61 431 119 221',
        email: 'iba@gmail.com',
        hours: 'Closed · Opens 5.30 am Thu'
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docRef = doc(db, "settings", "global");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setConfig(docSnap.data());
                }
            } catch (err) {
                console.error("Error fetching footer config:", err);
            }
        };
        fetchConfig();
    }, []);

    return (
        <footer className={styles.footer}>
            <div className={`${styles.container} container`}>
                <div className={styles.grid}>
                    <div className={styles.info}>
                        <h3 className={styles.logo}>Cafe Da-Vina</h3>
                        <p className={styles.description}>
                            Modern Fusion Café serving comforting and tasty food in a cozy and inviting environment.
                        </p>
                        <div className={styles.socials}>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><Instagram size={20} /></a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><Facebook size={20} /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><Twitter size={20} /></a>
                        </div>
                    </div>

                    <div className={styles.links}>
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/menu">Menu</Link></li>
                            <li><Link href="/gallery">Gallery</Link></li>
                            <li><Link href="/booking">Reservations</Link></li>
                        </ul>
                    </div>

                    <div className={styles.contact}>
                        <h4>Contact Us</h4>
                        <ul>
                            <li><MapPin size={18} /> {config.address}</li>
                            <li><Phone size={18} /> {config.phone}</li>
                            <li><Mail size={18} /> {config.email}</li>
                            <li className={styles.statusBadge}>
                                <Clock size={18} style={{ marginRight: '8px' }} />
                                <strong>{config.hours}</strong>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; 2026 Cafe Da-Vina. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
