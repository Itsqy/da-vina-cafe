"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '#menu' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact', href: '/contact' },
];

export default function Navbar({ theme = 'light' }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''} ${theme === 'dark' ? styles.darkTheme : ''}`}>
            <div className={`container ${styles.navContainer}`}>
                <Link href="/" className={styles.logo} onClick={handleLinkClick}>
                    <div className={styles.logoMark}>
                        <Coffee size={20} />
                    </div>
                    Cafe Davina
                </Link>

                {/* Desktop Nav */}
                <div className={styles.navLinks}>
                    {NAV_LINKS.map(link => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={styles.navItem}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className={styles.navActions}>
                    <Link href="/booking" className="btn btn-primary btn-nav">
                        Visit Us
                    </Link>

                    {/* Mobile Toggle */}
                    <button
                        className={styles.menuToggle}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className={styles.mobileMenu}>
                        {NAV_LINKS.map(link => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={styles.mobileNavItem}
                                onClick={handleLinkClick}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/booking" className="btn btn-primary" onClick={handleLinkClick}>
                            Visit Us
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
