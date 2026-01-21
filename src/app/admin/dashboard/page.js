"use client";
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {
    LogOut, LayoutDashboard, Utensils, Calendar, Settings,
    Trash2, Check, X, Edit2
} from 'lucide-react';
import styles from '../Admin.module.css';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (!u) {
                router.push('/admin');
            } else {
                setUser(u);
                fetchData();
            }
        });
        return () => unsubscribe();
    }, [router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Bookings
            const bookingsRef = collection(db, 'bookings');
            const q = query(bookingsRef, orderBy('createdAt', 'desc'));
            const bookingsSnap = await getDocs(q);
            setBookings(bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch Menu (Assuming it's in Firestore too now for CRUD)
            const menuRef = collection(db, 'menu');
            const menuSnap = await getDocs(menuRef);
            setMenuItems(menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error("Error fetching admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/admin');
    };

    const deleteBooking = async (id) => {
        if (confirm('Are you sure you want to cancel this booking?')) {
            await deleteDoc(doc(db, 'bookings', id));
            setBookings(bookings.filter(b => b.id !== id));
        }
    };

    if (!user) return <div className={styles.loader}>Loading...</div>;

    return (
        <div className={styles.dashboard}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h3>Admin Panel</h3>
                </div>
                <nav className={styles.sidebarNav}>
                    <button
                        className={activeTab === 'bookings' ? styles.active : ''}
                        onClick={() => setActiveTab('bookings')}
                    >
                        <Calendar size={20} /> Bookings
                    </button>
                    <button
                        className={activeTab === 'menu' ? styles.active : ''}
                        onClick={() => setActiveTab('menu')}
                    >
                        <Utensils size={20} /> Menu Items
                    </button>
                    <button
                        className={activeTab === 'settings' ? styles.active : ''}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} /> Settings
                    </button>
                </nav>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.mainHeader}>
                    <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                    <div className={styles.userInfo}>
                        <span>Welcome, {user.email}</span>
                    </div>
                </header>

                <div className={styles.contentCard}>
                    {activeTab === 'bookings' && (
                        <div className={styles.tableWrapper}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Guests</th>
                                        <th>Customer Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b.id}>
                                            <td>{b.date}</td>
                                            <td>{b.time}</td>
                                            <td>{b.guests}</td>
                                            <td>{b.email}</td>
                                            <td>
                                                <button onClick={() => deleteBooking(b.id)} className={styles.actionBtnDelete}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {bookings.length === 0 && <p className={styles.emptyMsg}>No bookings found.</p>}
                        </div>
                    )}

                    {activeTab === 'menu' && (
                        <div className={styles.menuMgmt}>
                            <div className={styles.mgmtHeader}>
                                <h3>Manage Menu Items</h3>
                                <button className="btn btn-primary btn-sm">Add New Item</button>
                            </div>
                            <div className={styles.menuList}>
                                {menuItems.map(item => (
                                    <div key={item.id} className={styles.menuItemRow}>
                                        <img src={item.image} alt={item.name} />
                                        <div className={styles.itemMeta}>
                                            <h4>{item.name}</h4>
                                            <p>{item.price}</p>
                                        </div>
                                        <div className={styles.itemActions}>
                                            <button className={styles.actionBtnEdit}><Edit2 size={16} /></button>
                                            <button className={styles.actionBtnDelete}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                {menuItems.length === 0 && <p className={styles.emptyMsg}>No menu items found in database.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className={styles.settingsMgmt}>
                            <h3>Cafe Settings</h3>
                            <form className={styles.settingsForm}>
                                <div className={styles.formGroup}>
                                    <label>Phone Number</label>
                                    <input type="text" defaultValue="+61 431 119 221" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Opening Hours</label>
                                    <input type="text" defaultValue="Closed · Opens 5.30 am Thu" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Homepage Hero Text</label>
                                    <textarea defaultValue="Where Every Meal Feels Like Home"></textarea>
                                </div>
                                <button type="button" className="btn btn-primary">Save Changes</button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
