"use client";
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {
    Calendar, Check, X, Trash2, AlertCircle, Clock, Search, ArrowLeft
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import styles from '../Admin.module.css';

export default function BookingsManagementPage() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState({ show: false, type: '', title: '', message: '' });

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) {
                fetchBookings();
            } else {
                router.push('/admin');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const fetchBookings = async () => {
        try {
            const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error("Bookings fetch error:", err);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/admin');
    };

    const addLog = async (action, details, type = 'info') => {
        try {
            await addDoc(collection(db, 'activity_logs'), {
                action,
                details,
                type,
                user: user?.email || 'System',
                timestamp: serverTimestamp()
            });
        } catch (err) {
            console.error("Failed to save log:", err);
        }
    };

    const confirmBooking = async (booking) => {
        setProcessingId(booking.id);
        try {
            await updateDoc(doc(db, 'bookings', booking.id), { status: 'confirmed' });

            // Call email API
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

            if (!response.ok) throw new Error('Failed to send email confirmation');

            setModal({
                show: true,
                type: 'success',
                title: 'Booking Confirmed',
                message: `Confirmation email sent to ${booking.email}.`
            });

            await addLog('Booking Confirmed', `Email sent to ${booking.email}`, 'success');
            setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: 'confirmed' } : b));
        } catch (error) {
            console.error(error);
            setModal({
                show: true,
                type: 'error',
                title: 'Process Failed',
                message: error.message
            });
        } finally {
            setProcessingId(null);
        }
    };

    const deleteBooking = async (id, email) => {
        if (confirm(`Are you sure you want to cancel booking for ${email}?`)) {
            setProcessingId(id);
            try {
                await deleteDoc(doc(db, 'bookings', id));
                setBookings(bookings.filter(b => b.id !== id));
                await addLog('Booking Cancelled', `Booking for ${email} was removed.`, 'warning');
            } catch (err) {
                console.error(err);
                alert("Failed to delete booking.");
            } finally {
                setProcessingId(null);
            }
        }
    };

    const filteredBookings = bookings.filter(b =>
        b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className={styles.loading}>Initializing...</div>;

    return (
        <div className={styles.appShell}>
            <AdminSidebar user={user} onLogout={handleLogout} />

            <main className={styles.mainArea}>
                <header className={styles.topbar}>
                    <div className={styles.topbarLeft}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button onClick={() => router.push('/admin')} className={styles.btnOutlineSm} style={{ padding: '8px' }}>
                                <ArrowLeft size={16} />
                            </button>
                            <div>
                                <div className={styles.topbarTitle}>Booking Management</div>
                                <div className={styles.topbarSubtitle}>Review and manage customer table reservations.</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.topbarRight}>
                        <div className={styles.searchWrapper}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className={styles.pillInput}
                                style={{ width: '280px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <div className={styles.column}>
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitleGroup}>
                                <div className={styles.cardTitle}>Recent Reservations</div>
                                <div className={styles.cardSubtitle}>Total {bookings.length} reservations found.</div>
                            </div>
                        </div>

                        <div className={styles.tagRow} style={{ padding: '0 24px 16px' }}>
                            <div className={`${styles.statusPill} ${styles.statusPending}`}>
                                <Clock size={14} /> {bookings.filter(b => b.status !== 'confirmed').length} Pending
                            </div>
                            <div className={`${styles.statusPill} ${styles.statusConfirmed}`}>
                                <Check size={14} /> {bookings.filter(b => b.status === 'confirmed').length} Confirmed
                            </div>
                        </div>

                        <div style={{ overflow: 'auto' }}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Email</th>
                                        <th>Date & Time</th>
                                        <th>Guests</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map(b => (
                                        <tr key={b.id}>
                                            <td style={{ fontWeight: '600' }}>{b.name || b.email.split('@')[0]}</td>
                                            <td>{b.email}</td>
                                            <td>{b.date}, {b.time}</td>
                                            <td>{b.guests} Guests</td>
                                            <td>
                                                <span className={`${styles.statusPill} ${b.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending}`}>
                                                    {b.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    {b.status !== 'confirmed' && (
                                                        <button
                                                            className={styles.badgeSuccess}
                                                            onClick={() => confirmBooking(b)}
                                                            disabled={processingId === b.id}
                                                        >
                                                            {processingId === b.id ? <div className={styles.spinner} style={{ width: '12px', height: '12px' }} /> : 'Confirm'}
                                                        </button>
                                                    )}
                                                    <button
                                                        className={styles.badgeMuted}
                                                        onClick={() => deleteBooking(b.id, b.email)}
                                                        disabled={processingId === b.id}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredBookings.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className={styles.emptyMsg}>No bookings found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>

            {modal.show && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={`${styles.modalIcon} ${modal.type === 'success' ? styles.success : styles.error}`}>
                            {modal.type === 'success' ? <Check size={32} /> : <AlertCircle size={32} />}
                        </div>
                        <h3>{modal.title}</h3>
                        <p>{modal.message}</p>
                        <button className={styles.btnPrimary} style={{ width: '100%' }} onClick={() => setModal({ ...modal, show: false })}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
