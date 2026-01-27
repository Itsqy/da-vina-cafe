"use client";
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, query, orderBy, limit, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, Utensils, Calendar, Settings,
    Check, AlertCircle, History, Image as ImageIcon,
    Save as SaveIcon, ShieldCheck, Plus, ChevronDown, Clock, ArrowRight
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import styles from './Admin.module.css';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        pendingBookings: 0,
        totalMenuItems: 0,
        activeDishes: 0,
        recentLogs: []
    });
    const [bookings, setBookings] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) {
                fetchDashboardData();
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch Bookings Summary
            const bookingsSnap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(5)));
            const bookingsList = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBookings(bookingsList);

            // Fetch Menu Summary
            const menuSnap = await getDocs(collection(db, 'menu_items'));
            const menuList = menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMenuItems(menuList.slice(0, 5));


            // Fetch Recent Logs
            const logsSnap = await getDocs(query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(5)));
            const logsList = logsSnap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestampStr: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : 'Just now'
                };
            });

            setStats({
                pendingBookings: bookingsList.filter(b => b.status !== 'confirmed').length,
                totalMenuItems: menuList.length,
                activeDishes: 0,
                recentLogs: logsList
            });
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setLoginError('Invalid email or password.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    if (loading) return <div className={styles.loading}>Initializing Dashboard...</div>;

    if (!user) {
        return (
            <div className={styles.loginPage}>
                <div className={styles.loginCard}>
                    <h1>Admin Login</h1>
                    <p>Enter your credentials to manage Cafe Davina.</p>
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        {loginError && <p className={styles.errorMsg}>{loginError}</p>}
                        <button type="submit" className={styles.btnPrimary}>Login to Dashboard</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.appShell}>
            <AdminSidebar user={user} onLogout={handleLogout} />

            <main className={styles.mainArea}>
                <header className={styles.topbar}>
                    <div className={styles.topbarLeft}>
                        <div className={styles.topbarTitle}>Dashboard Overview</div>
                        <div className={styles.topbarSubtitle}>Welcome back, {user.email.split('@')[0]}. Here is what's happening today.</div>
                    </div>
                </header>

                <div className={styles.contentGrid}>
                    <div className={styles.column}>
                        {/* Summary Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
                            <div className={styles.card} style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '8px' }}>Pending Bookings</div>
                                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>{stats.pendingBookings}</div>
                            </div>
                            <div className={styles.card} style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '8px' }}>Menu Items</div>
                                <div style={{ fontSize: '32px', fontWeight: '800' }}>{stats.totalMenuItems}</div>
                            </div>
                        </div>

                        {/* Recent Bookings */}
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitleGroup}>
                                    <div className={styles.cardTitle}>Recent Bookings</div>
                                    <div className={styles.cardSubtitle}>Latest customer reservations.</div>
                                </div>
                                <button className={styles.btnOutlineSm} onClick={() => router.push('/admin/bookings')}>
                                    View All <ArrowRight size={12} />
                                </button>
                            </div>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map(b => (
                                            <tr key={b.id}>
                                                <td data-label="Customer">{b.email.split('@')[0]}</td>
                                                <td data-label="Date">{b.date}</td>
                                                <td data-label="Status">
                                                    <span className={`${styles.statusPill} ${b.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending}`}>
                                                        {b.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Signature Selection Summary */}
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitleGroup}>
                                    <div className={styles.cardTitle}>Menu Items</div>
                                    <div className={styles.cardSubtitle}>Total {stats.totalMenuItems} items on the menu.</div>
                                </div>
                                <button className={styles.btnOutlineSm} onClick={() => router.push('/admin/menu')}>
                                    Manage Menu <ArrowRight size={12} />
                                </button>
                            </div>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {menuItems.map(item => (
                                            <tr key={item.id}>
                                                <td data-label="Item" style={{ fontWeight: '600' }}>{item.name}</td>
                                                <td data-label="Category"><span className={styles.badgeMuted}>{item.category}</span></td>
                                                <td data-label="Price">{item.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    <div className={styles.column}>
                        {/* Quick Actions */}
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitleGroup}>
                                    <div className={styles.cardTitle}>Quick Links</div>
                                    <div className={styles.cardSubtitle}>Direct access to management tools.</div>
                                </div>
                            </div>
                            <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button className={styles.btnOutline} style={{ justifyContent: 'space-between', width: '100%' }} onClick={() => router.push('/admin/settings')}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Settings size={16} /> Edit Global Settings</span>
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </section>

                        {/* Recent Activity */}
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitleGroup}>
                                    <div className={styles.cardTitle}>Recent Activity</div>
                                    <div className={styles.cardSubtitle}>Audit trail of system events.</div>
                                </div>
                                <button className={styles.btnOutlineSm} onClick={() => router.push('/admin/logs')}>
                                    Full Logs
                                </button>
                            </div>
                            <div className={styles.logList}>
                                {stats.recentLogs.map(log => (
                                    <div key={log.id} className={styles.logItem}>
                                        <div className={styles.logMain}>
                                            <div className={styles.logAction}>{log.action}</div>
                                            <div className={styles.logMeta}>{log.timestampStr} · {log.user}</div>
                                        </div>
                                        <span className={`${styles.statusPillSm} ${log.type === 'success' ? styles.statusConfirmed : styles.statusPending}`}>
                                            {log.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Auth Status */}
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitleGroup}>
                                    <div className={styles.cardTitle}>Protected Session</div>
                                    <div className={styles.cardSubtitle}>Cloud Firestore connection active.</div>
                                </div>
                                <div className={styles.badgeSuccess}>Secure</div>
                            </div>
                            <div style={{ padding: '0 24px 24px' }}>
                                <div className={styles.miniLabel}>Current Session</div>
                                <div className={styles.pillInput} style={{ background: 'var(--secondary)' }}>{user.email} (Administrator)</div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
