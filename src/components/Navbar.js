"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import styles from './Navbar.module.css';

const NAV_LINKS = [
    { label: 'Menu', href: '#menu' },
    { label: 'Ingredients', href: '#ingredients' },
    { label: 'Nutrition', href: '#nutrition' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);

            // Scroll Spy
            const sections = NAV_LINKS.map(link => link.href.substring(1));
            for (const section of sections.reverse()) {
                const el = document.getElementById(section);
                if (el && window.scrollY >= el.offsetTop - 100) {
                    setActiveSection(section);
                    break;
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.navContainer}`}>
                <Link href="/" className={styles.logo}>
                    Cafe Da Vina
                </Link>

                <div className={styles.navLinks}>
                    {NAV_LINKS.map(link => (
                        <a
                            key={link.href}
                            href={link.href}
                            className={`${styles.navLink} ${activeSection === link.href.substring(1) ? styles.active : ''}`}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className={styles.navActions}>
                    <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <Link href="/booking" className={styles.bookingBtn}>
                        Book a Table
                    </Link>
                </div>
            </div>
        </nav>
    );
}
