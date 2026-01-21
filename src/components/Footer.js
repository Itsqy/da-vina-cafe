import Link from 'next/link';
import { Instagram, Facebook, Twitter, MapPin, Phone, Clock } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`${styles.container} container`}>
                <div className={styles.grid}>
                    <div className={styles.info}>
                        <h3 className={styles.logo}>Cafe Da-Vina</h3>
                        <p className={styles.description}>
                            A lovely place for a delightful meal, serving comforting and tasty food in a cozy and inviting environment.
                        </p>
                        <div className={styles.socials}>
                            <a href="#"><Instagram size={20} /></a>
                            <a href="#"><Facebook size={20} /></a>
                            <a href="#"><Twitter size={20} /></a>
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
                            <li><MapPin size={18} /> 107 Astor Terrace, Spring Hill QLD 4000</li>
                            <li><Phone size={18} /> +61 431 119 221</li>
                            <li><Clock size={18} /> Opens 5.30 am Thu</li>
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
