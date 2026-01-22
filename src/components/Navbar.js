"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, Menu, X } from 'lucide-react';
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''} ${isMenuOpen ? styles.menuOpen : ''}`}>
            <div className={`container ${styles.navContainer}`}>
                <Link href="/" className={styles.logo} onClick={handleLinkClick}>
                    Cafe Da Vina
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className={styles.menuToggle}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle Menu"
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                <div className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksMobile : ''}`}>
                    {NAV_LINKS.map(link => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={handleLinkClick}
                            className={`${styles.navLink} ${activeSection === link.href.substring(1) ? styles.active : ''}`}
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className={styles.mobileActions}>
                        <button onClick={toggleTheme} className={styles.themeToggle}>
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />} Mode
                        </button>
                        <Link href="/booking" className={styles.bookingBtn} onClick={handleLinkClick}>
                            Book a Table
                        </Link>
                    </div>
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
