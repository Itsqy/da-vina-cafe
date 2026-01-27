"use client";
import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerGrid}>
                    <div className={styles.footerBrand}>
                        <h4>Cafe Davina</h4>
                        <p>Your neighborhood sanctuary for great coffee, fresh food, and warm company.</p>
                        <div className={styles.socialLinks}>
                            <a href="#"><Instagram size={24} /></a>
                            <a href="#"><Facebook size={24} /></a>
                            <a href="#"><Twitter size={24} /></a>
                        </div>
                    </div>
                    <div className={styles.footerCol}>
                        <h5>Discover</h5>
                        <Link href="/" className={styles.footerLink}>Home</Link>
                        <Link href="#menu" className={styles.footerLink}>Full Menu</Link>
                        <Link href="/about" className={styles.footerLink}>Our Story</Link>
                        <Link href="/careers" className={styles.footerLink}>Careers</Link>
                    </div>
                    <div className={styles.footerCol}>
                        <h5>Visit</h5>
                        <div className={styles.footerLink}>Jl. Kopi Harapan No. 12</div>
                        <div className={styles.footerLink}>Jakarta, ID 10220</div>
                        <Link href="#" className={styles.footerLink}>Get Directions</Link>
                    </div>
                    <div className={styles.footerCol}>
                        <h5>Hours</h5>
                        <div className={styles.footerLink}>Mon-Fri: 7am - 9pm</div>
                        <div className={styles.footerLink}>Sat-Sun: 8am - 10pm</div>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    © 2026 Cafe Davina. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
