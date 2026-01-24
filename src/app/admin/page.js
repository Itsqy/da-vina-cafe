"use client";
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy, addDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {
    LogOut, LayoutDashboard, Utensils, Calendar, Settings,
    Trash2, Check, X, Edit2, AlertCircle, History, Image as ImageIcon,
    Info, Save as SaveIcon
} from 'lucide-react';
import styles from './Admin.module.css';

const INITIAL_DISHES = [
    {
        id: 'salmon-avocado',
        name: "Salmon Avocado",
        subtitle: "FRESH & HEALTHY",
        description: "A delicious blend of rich salmon and creamy avocado, served with a light citrus dressing.",
        themeColor: "#8b5e3c",
        sequencePath: "/avocado-salmon-frame/ezgif-frame-",
        frameCount: 79,
        startIndex: 74,
        extension: 'png'
    },
    {
        id: 'grilled-tuna',
        name: "Grilled Tuna",
        subtitle: "LIGHT & SMOKY",
        description: "Perfectly grilled tuna, served with fresh greens and a smoky dressing.",
        themeColor: "#2a9d8f",
        sequencePath: "/avocado-salmon-frame/ezgif-frame-",
        frameCount: 79,
        startIndex: 74,
        extension: 'png'
    },
    {
        id: 'mediterranean-salad',
        name: "Mediterranean Salad",
        subtitle: "FRESH & ZESTY",
        description: "A refreshing salad of mixed greens, tomatoes, olives, and feta cheese with a zesty vinaigrette.",
        themeColor: "#e9c46a",
        sequencePath: "/avocado-salmon-frame/ezgif-frame-",
        frameCount: 79,
        startIndex: 74,
        extension: 'png'
    }
];

export default function AdminPage() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [dishes, setDishes] = useState(INITIAL_DISHES);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [settings, setSettings] = useState({
        phone: '+61 431 119 221',
        hours: 'Closed · Opens 5.30 am Thu',
        welcome: 'Where Every Meal Feels Like Home',
        address: '107 Astor Terrace, Spring Hill QLD 4000',
        email: 'iba@gmail.com'
    });
    const [modal, setModal] = useState({ show: false, type: '', title: '', message: '' });

    // Login States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) {
                fetchData();
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const fetchData = async () => {
        // Individual fetchers so one failure doesn't block everything
        const fetchBookings = async () => {
            try {
                const bookingsRef = collection(db, 'bookings');
                const q = query(bookingsRef, orderBy('createdAt', 'desc'));
                const snap = await getDocs(q);
                setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) { console.error("Bookings fetch error:", err); }
        };

        const fetchMenu = async () => {
            try {
                // Corrected collection name
                const menuRef = collection(db, 'menu_items');
                const snap = await getDocs(menuRef);
                setMenuItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) { console.error("Menu fetch error:", err); }
        };

        const fetchDishes = async () => {
            try {
                const snap = await getDocs(collection(db, "dishes"));
                if (!snap.empty) {
                    setDishes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
            } catch (err) { console.error("Dishes fetch error:", err); }
        };

        const fetchLogs = async () => {
            try {
                const logsRef = collection(db, 'activity_logs');
                const logsQ = query(logsRef, orderBy('timestamp', 'desc'));
                const snap = await getDocs(logsQ);
                setLogs(snap.docs.map(doc => {
                    const data = doc.data();
                    let displayTime = 'Just now';
                    if (data.timestamp?.toDate) {
                        displayTime = data.timestamp.toDate().toLocaleString();
                    } else if (data.timestamp) {
                        displayTime = new Date(data.timestamp).toLocaleString();
                    }
                    return { id: doc.id, ...data, timestamp: displayTime };
                }));
            } catch (err) { console.error("Logs fetch error:", err); }
        };

        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'global');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data());
                }
            } catch (err) { console.error("Settings fetch error:", err); }
        };

        await Promise.allSettled([fetchBookings(), fetchMenu(), fetchDishes(), fetchLogs(), fetchSettings()]);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setLoginError('Invalid email or password. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    const addLog = async (action, details, type = 'info') => {
        try {
            const logEntry = {
                action,
                details,
                type,
                user: user?.email || 'System',
                timestamp: serverTimestamp()
            };
            const docRef = await addDoc(collection(db, 'activity_logs'), logEntry);
            setLogs(prev => [{
                ...logEntry,
                id: docRef.id,
                timestamp: new Date().toLocaleString()
            }, ...prev]);
        } catch (err) {
            console.error("Failed to save log:", err);
        }
    };

    const deleteBooking = async (id) => {
        if (confirm('Are you sure you want to cancel this booking?')) {
            setProcessingId(id);
            try {
                await deleteDoc(doc(db, 'bookings', id));
                setBookings(bookings.filter(b => b.id !== id));
            } catch (err) {
                console.error("Error deleting booking:", err);
                alert("Failed to delete booking");
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleSaveSettings = async () => {
        setProcessingId('global-settings');
        try {
            await setDoc(doc(db, 'settings', 'global'), settings);
            setModal({
                show: true,
                type: 'success',
                title: 'Settings Saved',
                message: 'Global site configuration has been updated successfully.'
            });
        } catch (err) {
            console.error("Error saving settings:", err);
            setModal({
                show: true,
                type: 'error',
                title: 'Save Failed',
                message: err.message
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handleUpdateDish = async (dish) => {
        setProcessingId(dish.id);
        try {
            const dishRef = doc(db, 'dishes', dish.id);
            await setDoc(dishRef, dish, { merge: true });

            setModal({
                show: true,
                type: 'success',
                title: 'Dish Updated',
                message: `${dish.name} configuration has been saved successfully.`
            });
        } catch (error) {
            console.error("Error updating dish:", error);
            setModal({
                show: true,
                type: 'error',
                title: 'Update Failed',
                message: error.message
            });
        } finally {
            setProcessingId(null);
        }
    };

    const confirmBooking = async (booking) => {
        setProcessingId(booking.id);
        try {
            const bookingRef = doc(db, 'bookings', booking.id);
            await updateDoc(bookingRef, { status: 'confirmed' });

            const response = await fetch('/api/confirm-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: booking.email,
                    date: booking.date,
                    time: booking.time,
                    guests: booking.guests,
                    name: booking.name || 'Customer'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send email');
            }

            setModal({
                show: true,
                type: 'success',
                title: 'Booking Confirmed',
                message: `Confirmation email has been sent successfully to ${booking.email}.`
            });

            await addLog('NodeMailer Dispatch', `Confirmation email successfully sent to ${booking.email}`, 'success');

            setBookings(bookings.map(b =>
                b.id === booking.id ? { ...b, status: 'confirmed' } : b
            ));

        } catch (error) {
            console.error("Error confirming booking:", error);
            await addLog('NodeMailer Error', `Failed to dispatch email to ${booking.email}: ${error.message}`, 'error');
            setModal({
                show: true,
                type: 'error',
                title: 'Process Failed',
                message: error.message || 'Something went wrong while confirming the booking.'
            });
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    if (!user) {
        return (
            <div className={styles.loginPage}>
                <div className={styles.loginCard}>
                    <h1>Admin Login</h1>
                    <p>Enter your credentials to manage the cafe.</p>
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <div className={styles.inputGroup}>
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@cafedavina.com"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {loginError && <p className={styles.errorMsg}>{loginError}</p>}
                        <button type="submit" className={styles.modalBtn} style={{ width: '100%', marginTop: '1rem' }}>Login to Dashboard</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h3>Da Vina Admin Dashboard</h3>
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
                        className={activeTab === 'dishes' ? styles.active : ''}
                        onClick={() => setActiveTab('dishes')}
                    >
                        <ImageIcon size={20} /> Hero Variants
                    </button>
                    <button
                        className={activeTab === 'settings' ? styles.active : ''}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} /> Settings
                    </button>
                    <button
                        className={activeTab === 'logs' ? styles.active : ''}
                        onClick={() => setActiveTab('logs')}
                    >
                        <History size={20} /> Activity Log
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
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b.id}>
                                            <td style={{ fontWeight: '600', color: '#fff' }}>{b.date}</td>
                                            <td>{b.time}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ color: 'var(--accent-color)' }}>●</span>
                                                    {b.guests} Guests
                                                </div>
                                            </td>
                                            <td style={{ color: '#94a3b8' }}>{b.email}</td>
                                            <td>
                                                <span className={b.status === 'confirmed' ? styles.statusBadgeConfirmed : styles.statusBadgePending}>
                                                    {b.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                {b.status !== 'confirmed' && (
                                                    <button
                                                        onClick={() => confirmBooking(b)}
                                                        className={styles.actionBtnConfirm}
                                                        disabled={processingId === b.id}
                                                        title="Confirm Booking"
                                                    >
                                                        {processingId === b.id ? <div className={styles.spinner} /> : <Check size={18} />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteBooking(b.id)}
                                                    className={styles.actionBtnDelete}
                                                    disabled={processingId === b.id}
                                                    title="Cancel Booking"
                                                >
                                                    {processingId === b.id ? <div className={styles.spinner} style={{ borderTopColor: '#f87171' }} /> : <X size={18} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {bookings.length === 0 && <p className={styles.emptyMsg}>No bookings found in the system.</p>}
                        </div>
                    )}

                    {activeTab === 'menu' && (
                        <div className={styles.menuMgmt}>
                            <div className={styles.mgmtHeader}>
                                <h3>Signature Selection</h3>
                                <button className="btn btn-primary btn-sm">+ Add Item</button>
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
                                            <button className={styles.actionBtnEdit} title="Edit Item"><Edit2 size={16} /></button>
                                            <button className={styles.actionBtnDelete} title="Delete Item"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                {menuItems.length === 0 && (
                                    <div className={styles.emptyMsg} style={{ gridColumn: '1/-1' }}>
                                        No menu items found in the database.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'dishes' && (
                        <div className={styles.dishesMgmt}>
                            <div className={styles.mgmtHeader}>
                                <h3>Hero Experience</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Cinematic parallax dish configurations</p>
                            </div>
                            <div className={styles.dishesList}>
                                {dishes.map((dish, index) => (
                                    <div key={dish.id || index} className={styles.dishCard}>
                                        <div className={styles.inputRow}>
                                            <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
                                                <label>Main Title</label>
                                                <input
                                                    value={dish.name}
                                                    onChange={(e) => setDishes(dishes.map(d => d.id === dish.id ? { ...d, name: e.target.value } : d))}
                                                    placeholder="Dish Name"
                                                />
                                            </div>
                                            <div className={styles.formGroup} style={{ width: '80px', marginBottom: 0 }}>
                                                <label>Theme</label>
                                                <input
                                                    type="color"
                                                    value={dish.themeColor}
                                                    onChange={(e) => setDishes(dishes.map(d => d.id === dish.id ? { ...d, themeColor: e.target.value } : d))}
                                                    style={{ height: '46px', cursor: 'pointer' }}
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                                            <label>Subtitle Label</label>
                                            <input
                                                value={dish.subtitle}
                                                onChange={(e) => setDishes(dishes.map(d => d.id === dish.id ? { ...d, subtitle: e.target.value } : d))}
                                                placeholder="Subtitle"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Narrative Description</label>
                                            <textarea
                                                value={dish.description}
                                                onChange={(e) => setDishes(dishes.map(d => d.id === dish.id ? { ...d, description: e.target.value } : d))}
                                                placeholder="Description"
                                            />
                                        </div>

                                        <div className={styles.inputRow} style={{ gap: '1rem', marginTop: '1rem' }}>
                                            <div className={styles.formGroup} style={{ flex: 2 }}>
                                                <label>Sequence Path</label>
                                                <input
                                                    value={dish.sequencePath}
                                                    onChange={(e) => setDishes(dishes.map(d => d.id === dish.id ? { ...d, sequencePath: e.target.value } : d))}
                                                />
                                            </div>
                                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                                <label>Frames</label>
                                                <input
                                                    type="number"
                                                    value={dish.frameCount}
                                                    onChange={(e) => setDishes(dishes.map(d => d.id === dish.id ? { ...d, frameCount: parseInt(e.target.value) } : d))}
                                                />
                                            </div>
                                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                                <label>Start</label>
                                                <input
                                                    type="number"
                                                    value={dish.startIndex || 0}
                                                    onChange={(e) => setDishes(dishes.map(d => d.id === dish.id ? { ...d, startIndex: parseInt(e.target.value) } : d))}
                                                />
                                            </div>
                                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                                <label>Ext</label>
                                                <input
                                                    value={dish.extension}
                                                    onChange={(e) => setDishes(dishes.map(d => d.id === dish.id ? { ...d, extension: e.target.value } : d))}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            className="btn btn-primary"
                                            style={{ width: '100%', marginTop: '1.5rem', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
                                            onClick={() => handleUpdateDish(dish)}
                                            disabled={processingId === dish.id}
                                        >
                                            {processingId === dish.id ? <div className={styles.spinner} /> : <SaveIcon size={18} />}
                                            Save Configuration
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className={styles.settingsMgmt}>
                            <div className={styles.mgmtHeader}>
                                <h3>Cafe Identity</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your public store information</p>
                            </div>
                            <form className={styles.settingsForm} onSubmit={(e) => { e.preventDefault(); handleSaveSettings(); }}>
                                <div className={styles.formGroup}>
                                    <label>Contact Phone</label>
                                    <input
                                        type="text"
                                        value={settings.phone}
                                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        placeholder="+61 000 000 000"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Operational Hours</label>
                                    <input
                                        type="text"
                                        value={settings.hours}
                                        onChange={(e) => setSettings({ ...settings, hours: e.target.value })}
                                        placeholder="Mon-Sun: 9am - 9pm"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Store Location</label>
                                    <input
                                        type="text"
                                        value={settings.address}
                                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                        placeholder="123 Street Name, Suburb State Postcode"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Customer Service Email</label>
                                    <input
                                        type="email"
                                        value={settings.email}
                                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                        placeholder="cs@example.com"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Home Screen Welcome Message</label>
                                    <textarea
                                        value={settings.welcome}
                                        onChange={(e) => setSettings({ ...settings, welcome: e.target.value })}
                                        placeholder="Welcome Message"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: '1rem', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
                                    disabled={processingId === 'global-settings'}
                                >
                                    {processingId === 'global-settings' ? <div className={styles.spinner} /> : <SaveIcon size={18} />}
                                    Apply Global Settings
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className={styles.logsMgmt}>
                            <div className={styles.mgmtHeader}>
                                <div>
                                    <h3>Email Dispatch Logs</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Audit trail for NodeMailer communications</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => fetchData()}
                                        className={styles.actionBtnEdit}
                                        title="Refresh Logs"
                                    >
                                        <History size={18} />
                                    </button>
                                    <button
                                        onClick={() => addLog('NodeMailer Test', 'Manual NodeMailer connection verification', 'info')}
                                        className="btn btn-outline btn-sm"
                                        style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                                    >
                                        Test Email Service
                                    </button>
                                </div>
                            </div>
                            <div className={styles.tableWrapper}>
                                <table className={styles.logTable}>
                                    <thead>
                                        <tr>
                                            <th>Timestamp</th>
                                            <th>Action Type</th>
                                            <th>Description</th>
                                            <th>Operator</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map(log => (
                                            <tr key={log.id}>
                                                <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{log.timestamp}</td>
                                                <td><strong style={{ color: '#f8fafc', fontWeight: '600' }}>{log.action}</strong></td>
                                                <td style={{ fontSize: '0.9rem' }}>{log.details}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-color)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                            {log.user?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontSize: '0.85rem' }}>{log.user}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`${styles.logType} ${log.type === 'success' ? styles.typeSuccess :
                                                        log.type === 'warning' ? styles.typeWarning :
                                                            log.type === 'error' ? styles.typeError : styles.typeInfo
                                                        }`}>
                                                        {log.type}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {logs.length === 0 && <p className={styles.emptyMsg}>No system logs available.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Status Modal */}
            {modal.show && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={`${styles.modalIcon} ${modal.type === 'success' ? styles.success : styles.error}`}>
                            {modal.type === 'success' ? <Check size={32} /> : <AlertCircle size={32} />}
                        </div>
                        <h3>{modal.title}</h3>
                        <p>{modal.message}</p>
                        <button
                            className={styles.modalBtn}
                            onClick={() => setModal({ ...modal, show: false })}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
