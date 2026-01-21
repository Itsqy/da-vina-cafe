"use client";
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Coffee } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className={styles.navbar}>
            <div className={`${styles.container} container`}>
                <Link href="/" className={styles.logo}>
                    <Coffee size={32} color="var(--accent-primary)" />
                    <span>Cafe Da-Vina</span>
                </Link>

                <div className={`${styles.links} ${isOpen ? styles.active : ''}`}>
                    <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
                    <Link href="/menu" onClick={() => setIsOpen(false)}>Menu</Link>
                    <Link href="/gallery" onClick={() => setIsOpen(false)}>Gallery</Link>
                    <Link href="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
                    <Link href="/booking" className="btn btn-primary" onClick={() => setIsOpen(false)}>Book a Table</Link>
                </div>

                <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>
        </nav>
    );
}
