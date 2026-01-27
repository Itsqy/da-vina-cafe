"use client";
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {
    Settings, Check, AlertCircle, Save as SaveIcon, ArrowLeft, Info, Globe, ShieldCheck, Mail, Phone, MapPin, Clock, Image as ImageIcon
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import ImageUpload from '@/components/ImageUpload';
import styles from '../Admin.module.css';

export default function GlobeSettingsPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [settings, setSettings] = useState({
        phone: '+62 812 3456 7890',
        hours: 'Mon–Fri 08:00–22:00',
        welcome: 'A Warm Welcome in Every Cup',
        address: 'Jl. Kopi Harapan No. 12, Jakarta',
        email: 'halo@cafedavina.com',
        customerServiceEmail: 'rifqisyatria@gmail.com',
        heroImage: 'https://storage.googleapis.com/banani-generated-images/generated-images/de63915b-8f34-47fe-bddd-6e1f90159747.jpg',
        heroSubtitle: 'Experience the coziest corner in town. Hand-crafted coffee, fresh pastries, and a space designed for connection.',
        storyImage: 'https://storage.googleapis.com/banani-generated-images/generated-images/a604cbb0-d28f-4f46-ba64-3d4df5bce336.jpg',
        experienceImage: 'https://storage.googleapis.com/banani-generated-images/generated-images/aa22fa01-567b-402e-ad9e-cde85b3da042.jpg'
    });
    const [feedback, setFeedback] = useState({ show: false, type: '', title: '', message: '' });

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) {
                fetchSettings();
            } else {
                router.push('/admin');
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchSettings = async () => {
        try {
            const docSnap = await getDoc(doc(db, 'settings', 'global'));
            if (docSnap.exists()) {
                const data = docSnap.data();
                setSettings(prev => ({
                    ...prev,
                    ...data
                }));
            }
        } catch (err) {
            console.error("Settings fetch error:", err);
        } finally {
            setLoading(false);
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

    const handleSave = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await setDoc(doc(db, 'settings', 'global'), settings);
            await addLog('Global Settings Updated', 'Contact info and welcome message changed.', 'info');
            setFeedback({
                show: true,
                type: 'success',
                title: 'Settings Saved',
                message: 'Global configuration has been updated successfully.'
            });
        } catch (err) {
            setFeedback({ show: true, type: 'error', title: 'Save Failed', message: err.message });
        } finally {
            setProcessing(false);
        }
    };

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
                                <div className={styles.topbarTitle}>Global Site Settings</div>
                                <div className={styles.topbarSubtitle}>Configure website identity, contact info, and business hours.</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.topbarRight}>
                        <button className={styles.btnPrimary} onClick={handleSave} disabled={processing}>
                            {processing ? <div className={styles.spinner} /> : <><SaveIcon size={16} /> Save Changes</>}
                        </button>
                    </div>
                </header>

                <div className={styles.column} style={{ maxWidth: '800px' }}>
                    <form onSubmit={handleSave} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitleGroup}>
                                <div className={styles.cardTitle}>Identity & Contact</div>
                                <div className={styles.cardSubtitle}>Information used in footer and contact sections.</div>
                            </div>
                            <Globe size={20} className={styles.mutedIcon} />
                        </div>

                        <div className={styles.fieldGrid2} style={{ padding: '0 24px 16px' }}>
                            <div className={styles.inputGroup}>
                                <label className={styles.pillInputLabel}><Phone size={12} style={{ marginRight: '4px' }} /> Phone Number</label>
                                <input
                                    className={styles.pillInput}
                                    value={settings.phone || ''}
                                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.pillInputLabel}><Mail size={12} style={{ marginRight: '4px' }} /> Support Email</label>
                                <input
                                    className={styles.pillInput}
                                    value={settings.email || ''}
                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup} style={{ padding: '0 24px 16px' }}>
                            <label className={styles.pillInputLabel}><Mail size={12} style={{ marginRight: '4px' }} /> Customer Service Email (Central)</label>
                            <input
                                className={styles.pillInput}
                                value={settings.customerServiceEmail || ''}
                                onChange={(e) => setSettings({ ...settings, customerServiceEmail: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup} style={{ padding: '0 24px 16px' }}>
                            <label className={styles.pillInputLabel}><MapPin size={12} style={{ marginRight: '4px' }} /> Store Address</label>
                            <input
                                className={styles.pillInput}
                                value={settings.address || ''}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup} style={{ padding: '0 24px 16px' }}>
                            <label className={styles.pillInputLabel}><Clock size={12} style={{ marginRight: '4px' }} /> Opening Hours</label>
                            <input
                                className={styles.pillInput}
                                value={settings.hours || ''}
                                onChange={(e) => setSettings({ ...settings, hours: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup} style={{ padding: '0 24px 16px' }}>
                            <label className={styles.pillInputLabel}><Info size={12} style={{ marginRight: '4px' }} /> Hero Welcome Message (Title)</label>
                            <textarea
                                className={styles.pillInput}
                                style={{ height: '60px' }}
                                value={settings.welcome || ''}
                                onChange={(e) => setSettings({ ...settings, welcome: e.target.value })}
                                required
                            />
                        </div>

                        <div style={{ padding: '0 24px 16px' }}>
                            <ImageUpload
                                label="Hero Background Image"
                                value={settings.heroImage}
                                onChange={(url) => setSettings({ ...settings, heroImage: url })}
                            />
                        </div>

                        <div className={styles.inputGroup} style={{ padding: '0 24px 24px' }}>
                            <label className={styles.pillInputLabel}><Info size={12} style={{ marginRight: '4px' }} /> Hero Description (Subtitle)</label>
                            <textarea
                                className={styles.pillInput}
                                style={{ height: '80px' }}
                                value={settings.heroSubtitle || ''}
                                onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.fieldGrid2} style={{ padding: '0 24px 24px' }}>
                            <ImageUpload
                                label="Story Section Image"
                                value={settings.storyImage}
                                onChange={(url) => setSettings({ ...settings, storyImage: url })}
                            />
                            <ImageUpload
                                label="Experience Section Image"
                                value={settings.experienceImage}
                                onChange={(url) => setSettings({ ...settings, experienceImage: url })}
                            />
                        </div>

                        <div className={styles.chipList} style={{ padding: '0 24px 24px', justifyContent: 'flex-start', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                            <div className={styles.statusPill} style={{ background: 'var(--success)', color: 'var(--success-foreground)' }}>
                                <ShieldCheck size={14} /> Firestore Secured
                            </div>
                            <div className={styles.statusPill} style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
                                Auto-sync across site
                            </div>
                        </div>
                    </form>
                </div>
            </main>

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
