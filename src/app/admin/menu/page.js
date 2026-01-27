"use client";
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {
    Plus, Search, Edit2, Trash2, Check, X, AlertCircle, Save as SaveIcon, Utensils, ArrowLeft
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import styles from '../Admin.module.css';

export default function MenuManagementPage() {
    const [user, setUser] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state for Add/Edit
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        image: '',
        status: 'Visible'
    });

    // Feedback modal
    const [feedback, setFeedback] = useState({ show: false, type: '', title: '', message: '' });

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) {
                fetchMenu();
            } else {
                router.push('/admin');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const fetchMenu = async () => {
        try {
            const snap = await getDocs(collection(db, 'menu_items'));
            setMenuItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error("Menu fetch error:", err);
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

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({ name: '', category: '', price: '', description: '', image: '', status: 'Visible' });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name || '',
            category: item.category || '',
            price: item.price || '',
            description: item.description || '',
            image: item.image || '',
            status: item.status || 'Visible'
        });
        setShowModal(true);
    };

    const handleDelete = async (id, name) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            setProcessingId(id);
            try {
                await deleteDoc(doc(db, 'menu_items', id));
                setMenuItems(menuItems.filter(item => item.id !== id));
                await addLog('Menu Item Deleted', `${name} was removed from the menu.`, 'warning');
            } catch (err) {
                setFeedback({
                    show: true,
                    type: 'error',
                    title: 'Delete Failed',
                    message: err.message
                });
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessingId('saving');
        try {
            if (editingItem) {
                // Update
                const itemRef = doc(db, 'menu_items', editingItem.id);
                await updateDoc(itemRef, { ...formData, updatedAt: serverTimestamp() });
                setMenuItems(menuItems.map(item => item.id === editingItem.id ? { ...item, ...formData } : item));
                await addLog('Menu Item Updated', `${formData.name} was updated.`, 'info');
            } else {
                // Add
                const docRef = await addDoc(collection(db, 'menu_items'), {
                    ...formData,
                    createdAt: serverTimestamp()
                });
                setMenuItems([...menuItems, { id: docRef.id, ...formData }]);
                await addLog('Menu Item Added', `${formData.name} was added to the menu.`, 'success');
            }
            setShowModal(false);
            setFeedback({
                show: true,
                type: 'success',
                title: editingItem ? 'Item Updated' : 'Item Added',
                message: `${formData.name} has been successfully saved.`
            });
        } catch (err) {
            setFeedback({
                show: true,
                type: 'error',
                title: 'Save Failed',
                message: err.message
            });
        } finally {
            setProcessingId(null);
        }
    };

    const filteredItems = menuItems.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
                                <div className={styles.topbarTitle}>Signature Selection Management</div>
                                <div className={styles.topbarSubtitle}>Add, edit, or remove featured menu items from the website.</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.topbarRight}>
                        <div className={styles.searchWrapper}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                            <input
                                type="text"
                                placeholder="Search menu items..."
                                className={styles.pillInput}
                                style={{ width: '240px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className={styles.btnPrimary} onClick={openAddModal}>
                            <Plus size={16} /> New Signature Item
                        </button>
                    </div>
                </header>

                <div className={styles.column}>
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitleGroup}>
                                <div className={styles.cardTitle}>Featured Menu List</div>
                                <div className={styles.cardSubtitle}>Showing {filteredItems.length} items</div>
                            </div>
                        </div>

                        <div style={{ overflow: 'auto' }}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map(item => (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: '600' }}>{item.name}</td>
                                            <td><span className={styles.badgeMuted}>{item.category}</span></td>
                                            <td>{item.price}</td>
                                            <td>
                                                <span className={`${styles.statusPill} ${item.status === 'Featured' ? styles.statusConfirmed : styles.statusPending}`}>
                                                    {item.status || 'Visible'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button className={styles.badgeMuted} onClick={() => openEditModal(item)}>
                                                        <Edit2 size={12} /> Edit
                                                    </button>
                                                    <button
                                                        className={styles.badgeDestructive}
                                                        onClick={() => handleDelete(item.id, item.name)}
                                                        disabled={processingId === item.id}
                                                    >
                                                        {processingId === item.id ? <div className={styles.spinner} style={{ width: '12px', height: '12px' }} /> : <><Trash2 size={12} /> Delete</>}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredItems.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className={styles.emptyMsg} style={{ textAlign: 'center', padding: '40px' }}>
                                                No items found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ textAlign: 'left', maxWidth: '500px', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 className={styles.cardTitle}>{editingItem ? 'Edit Signature Item' : 'New Signature Item'}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p className={styles.cardSubtitle} style={{ marginBottom: '20px' }}>
                            {editingItem ? 'Update the details of your featured dish.' : 'Add a new featured dish to your website menu.'}
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className={styles.inputGroup}>
                                <label className={styles.pillInputLabel}>Item Name</label>
                                <input
                                    className={styles.pillInput}
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Eggs on Salmon"
                                />
                            </div>

                            <div className={styles.fieldGrid2}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.pillInputLabel}>Category</label>
                                    <input
                                        className={styles.pillInput}
                                        value={formData.category || ''}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                        placeholder="e.g. Breakfast"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.pillInputLabel}>Price</label>
                                    <input
                                        className={styles.pillInput}
                                        value={formData.price || ''}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        placeholder="e.g. $18.50"
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.pillInputLabel}>Status</label>
                                <select
                                    className={styles.pillInput}
                                    value={formData.status || 'Visible'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    required
                                >
                                    <option value="Visible">Visible</option>
                                    <option value="Featured">Featured (Signature)</option>
                                    <option value="Hidden">Hidden</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.pillInputLabel}>Description</label>
                                <textarea
                                    className={styles.pillInput}
                                    style={{ height: '80px', resize: 'none' }}
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    placeholder="Write a short description of the dish..."
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.pillInputLabel}>Image Path</label>
                                <input
                                    className={styles.pillInput}
                                    value={formData.image || ''}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    required
                                    placeholder="e.g. /egg-on-salmon.webp"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" className={styles.btnOutline} style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.btnPrimary} style={{ flex: 2 }} disabled={processingId === 'saving'}>
                                    {processingId === 'saving' ? <div className={styles.spinner} /> : <><SaveIcon size={16} /> Save Item</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {feedback.show && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={`${styles.modalIcon} ${feedback.type === 'success' ? styles.success : styles.error}`}>
                            {feedback.type === 'success' ? <Check size={32} /> : <AlertCircle size={32} />}
                        </div>
                        <h3>{feedback.title}</h3>
                        <p>{feedback.message}</p>
                        <button className={styles.btnPrimary} style={{ width: '100%' }} onClick={() => setFeedback({ ...feedback, show: false })}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
