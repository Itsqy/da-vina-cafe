"use client";
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {
    LogOut, LayoutDashboard, Utensils, Calendar, Settings,
    Trash2, Check, X, Edit2, AlertCircle, History
} from 'lucide-react';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../Admin.module.css';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [modal, setModal] = useState({ show: false, type: '', title: '', message: '' });
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

            // Fetch Menu
            const menuRef = collection(db, 'menu');
            const menuSnap = await getDocs(menuRef);
            setMenuItems(menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch Logs
            const logsRef = collection(db, 'activity_logs');
            const logsQ = query(logsRef, orderBy('timestamp', 'desc'));
            const logsSnap = await getDocs(logsQ);
            setLogs(logsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate().toLocaleString() || 'Just now'
            })));
        } catch (err) {
            console.error("Error fetching admin data:", err);
        } finally {
            setLoading(false);
        }
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

            // Update local state for immediate feedback
            setLogs(prev => [{
                ...logEntry,
                id: docRef.id,
                timestamp: new Date().toLocaleString()
            }, ...prev]);
        } catch (err) {
            console.error("Failed to save log:", err);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/admin');
    };

    const deleteBooking = async (id) => {
        if (confirm('Are you sure you want to cancel this booking?')) {
            setProcessingId(id);
            try {
                await deleteDoc(doc(db, 'bookings', id));
                setBookings(bookings.filter(b => b.id !== id));
                await addLog('Delete Booking', `Cancelled booking ID: ${id}`, 'warning');
            } catch (err) {
                console.error("Error deleting booking:", err);
                await addLog('Error Deleting', `Failed to delete ${id}: ${err.message}`, 'error');
                alert("Failed to delete booking");
            } finally {
                setProcessingId(null);
            }
        }
    };

    const confirmBooking = async (booking) => {
        setProcessingId(booking.id);
        try {
            // 1. Update Firestore
            const bookingRef = doc(db, 'bookings', booking.id);
            await updateDoc(bookingRef, { status: 'confirmed' });

            // 2. Send Email
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

            // Success feedback
            setModal({
                show: true,
                type: 'success',
                title: 'Booking Confirmed',
                message: `Confirmation email has been sent successfully to ${booking.email}.`
            });

            await addLog('Confirm Booking', `Approved and emailed ${booking.email}`, 'success');

            // 3. Update Local State
            setBookings(bookings.map(b =>
                b.id === booking.id ? { ...b, status: 'confirmed' } : b
            ));

        } catch (error) {
            console.error("Error confirming booking:", error);
            await addLog('Error Confirming', `Failed to confirm ${booking.email}: ${error.message}`, 'error');
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
                                                <span className={b.status === 'confirmed' ? styles.statusBadgeConfirmed : styles.statusBadgePending}>
                                                    {b.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                                </span>
                                            </td>
                                            <td>
                                                {b.status !== 'confirmed' && (
                                                    <button
                                                        onClick={() => confirmBooking(b)}
                                                        className={styles.actionBtnConfirm}
                                                        disabled={processingId === b.id}
                                                        title="Confirm Booking"
                                                        style={{ marginRight: '8px', color: '#4CAF50' }}
                                                    >
                                                        {processingId === b.id ? <div className={styles.spinner} /> : <Check size={16} />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteBooking(b.id)}
                                                    className={styles.actionBtnDelete}
                                                    disabled={processingId === b.id}
                                                    title="Delete Booking"
                                                >
                                                    {processingId === b.id ? <div className={styles.spinner} style={{ borderTopColor: '#F44336' }} /> : <Trash2 size={16} />}
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

                    {activeTab === 'logs' && (
                        <div className={styles.logsMgmt}>
                            <div className={styles.mgmtHeader}>
                                <h3>Activity History</h3>
                                <p>Track confirmation emails and administrative actions.</p>
                            </div>
                            <div className={styles.tableWrapper}>
                                <table className={styles.logTable}>
                                    <thead>
                                        <tr>
                                            <th>Timestamp</th>
                                            <th>Action</th>
                                            <th>Details</th>
                                            <th>User</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map(log => (
                                            <tr key={log.id}>
                                                <td>{log.timestamp}</td>
                                                <td><strong>{log.action}</strong></td>
                                                <td>{log.details}</td>
                                                <td>{log.user}</td>
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
                                {logs.length === 0 && <p className={styles.emptyMsg}>No activity recorded yet.</p>}
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
