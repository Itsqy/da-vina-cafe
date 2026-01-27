import { LayoutDashboard, Calendar, ImageIcon, Settings, History, Utensils, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/app/admin/Admin.module.css';

export default function AdminSidebar({ user, onLogout }) {
    const pathname = usePathname();

    const isActive = (path) => pathname === path;

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <div className={styles.sidebarLogoMark}>D</div>
                <div className={styles.sidebarTitle}>
                    <div className={styles.sidebarTitleMain}>Cafe Davina</div>
                    <div className={styles.sidebarTitleSub}>Admin Console</div>
                </div>
            </div>

            <nav className={styles.sidebarNav}>
                <div className={styles.sidebarSectionLabel}>Overview</div>
                <Link href="/admin" className={isActive('/admin') ? styles.navItemActive : styles.navItem}>
                    <LayoutDashboard size={18} /> Dashboard
                </Link>
            </nav>

            <nav className={styles.sidebarNav}>
                <div className={styles.sidebarSectionLabel}>Operations</div>
                <Link href="/admin/bookings" className={isActive('/admin/bookings') ? styles.navItemActive : styles.navItem}>
                    <Calendar size={18} /> Booking Management
                </Link>
                <Link href="/admin/settings" className={isActive('/admin/settings') ? styles.navItemActive : styles.navItem}>
                    <Settings size={18} /> Global Settings
                </Link>
                <Link href="/admin/logs" className={isActive('/admin/logs') ? styles.navItemActive : styles.navItem}>
                    <History size={18} /> Activity Logs
                </Link>
                <Link href="/admin/menu" className={isActive('/admin/menu') ? styles.navItemActive : styles.navItem}>
                    <Utensils size={18} /> Menu Management
                </Link>
            </nav>

            <div className={styles.sidebarFooter}>
                {user && (
                    <div className={styles.sidebarAdmin}>
                        <div className={styles.sidebarAdminAvatar}>
                            <div className={styles.sidebarLogoMark} style={{ fontSize: '12px' }}>A</div>
                        </div>
                        <div className={styles.sidebarAdminInfo}>
                            <div className={styles.sidebarAdminName}>Admin Davina</div>
                            <div className={styles.sidebarAdminEmail}>{user.email}</div>
                        </div>
                    </div>
                )}
                <div className={styles.sidebarActions}>
                    <button onClick={onLogout} className={styles.sidebarTagLogout}>Logout</button>
                    <div className={styles.sidebarTag}>Firebase Active</div>
                </div>
            </div>
        </aside>
    );
}
