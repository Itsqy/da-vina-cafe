"use client";
import {
    LayoutDashboard,
    Calendar,
    Settings,
    History,
    Utensils,
    LogOut,
    User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/app/admin/Admin.module.css';

const NAV_ITEMS = [
    { label: 'Dash', icon: LayoutDashboard, href: '/admin' },
    { label: 'Booking', icon: Calendar, href: '/admin/bookings' },
    { label: 'Menu', icon: Utensils, href: '/admin/menu' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
    { label: 'Logs', icon: History, href: '/admin/logs' },
];

export default function AdminSidebar({ user, onLogout }) {
    const pathname = usePathname();

    const isActive = (path) => pathname === path;

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarLogoMark}>D</div>
                    <div className={styles.sidebarTitle}>
                        <div className={styles.sidebarTitleMain}>Cafe Da Vina</div>
                        <div className={styles.sidebarTitleSub}>Gourmet Experience</div>
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    <div className={styles.sidebarSectionLabel}>Administration</div>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={isActive(item.href) ? styles.navItemActive : styles.navItem}
                        >
                            <item.icon size={18} /> {item.label}
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    {user && (
                        <div className={styles.sidebarAdmin}>
                            <div className={styles.sidebarAdminAvatar} style={{ background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={16} />
                            </div>
                            <div className={styles.sidebarAdminInfo}>
                                <div className={styles.sidebarAdminName}>Admin User</div>
                                <div className={styles.sidebarAdminEmail}>{user.email}</div>
                            </div>
                        </div>
                    )}
                    <div className={styles.sidebarActions}>
                        <button onClick={onLogout} className={styles.sidebarTagLogout}>
                            <LogOut size={12} /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Top Bar */}
            <nav className={styles.sidebarMobileTop}>
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.mobileNavItem} ${isActive(item.href) ? styles.mobileNavItemActive : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                ))}
                <button onClick={onLogout} className={styles.mobileNavItem} style={{ border: 'none', background: 'none', padding: 0 }}>
                    <LogOut size={20} />
                    <span>Exit</span>
                </button>
            </nav>
        </>
    );
}
