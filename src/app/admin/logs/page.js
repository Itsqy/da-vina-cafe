"use client";
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {
    History, Clock, Search, ArrowLeft, Trash2, Filter, AlertCircle, Check
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import styles from '../Admin.module.css';

export default function ActivityLogsPage() {
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) {
                fetchLogs();
            } else {
                router.push('/admin');
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchLogs = async () => {
        try {
            const logsQ = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(100));
            const snap = await getDocs(logsQ);
            setLogs(snap.docs.map(doc => {
                const data = doc.data();
                let displayTime = 'Just now';
                if (data.timestamp?.toDate) {
                    displayTime = data.timestamp.toDate().toLocaleString();
                } else if (data.timestamp) {
                    displayTime = new Date(data.timestamp).toLocaleString();
                }
                return { id: doc.id, ...data, timestampStr: displayTime };
            }));
        } catch (err) {
            console.error("Logs fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearLogs = async () => {
        if (confirm('Are you sure you want to clear the last 100 logs? This action is permanent.')) {
            setProcessing(true);
            try {
                // For simplicity, we just delete the ones currently in view
                for (const log of logs) {
                    await deleteDoc(doc(db, 'activity_logs', log.id));
                }
                setLogs([]);
                await addDoc(collection(db, 'activity_logs'), {
                    action: 'Logs Cleared',
                    details: 'User manually cleared activity history.',
                    type: 'warning',
                    user: user?.email || 'Admin',
                    timestamp: serverTimestamp()
                });
            } catch (err) {
                alert('Failed to clear logs: ' + err.message);
            } finally {
                setProcessing(false);
                fetchLogs();
            }
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/admin');
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || log.type === filterType;
        return matchesSearch && matchesFilter;
    });

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
                                <div className={styles.topbarTitle}>Activity Logs</div>
                                <div className={styles.topbarSubtitle}>Audit trail of all administrative actions and system events.</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.topbarRight}>
                        <div className={styles.searchWrapper}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                className={styles.pillInput}
                                style={{ width: '220px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className={styles.pillInput}
                            style={{ width: '140px' }}
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="info">Info</option>
                            <option value="success">Success</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                        <button className={styles.btnOutline} onClick={handleClearLogs} disabled={processing || logs.length === 0}>
                            <Trash2 size={16} /> Clear View
                        </button>
                    </div>
                </header>

                <div className={styles.column}>
                    <section className={styles.card}>
                        <div className={styles.logList} style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
                            {filteredLogs.map(log => (
                                <div key={log.id} className={styles.logItem} style={{ borderBottom: '1px solid var(--border)', padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div className={styles.logMain}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className={styles.logAction} style={{ fontWeight: '600', fontSize: '15px' }}>{log.action}</div>
                                                <span className={`${styles.statusPillSm} ${log.type === 'success' ? styles.statusConfirmed :
                                                        log.type === 'warning' ? styles.statusPending :
                                                            log.type === 'error' ? styles.statusPending : ''
                                                    }`} style={{
                                                        background: log.type === 'error' ? '#fee2e2' : undefined,
                                                        color: log.type === 'error' ? '#991b1b' : undefined
                                                    }}>
                                                    {log.type}
                                                </span>
                                            </div>
                                            <div style={{ marginTop: '4px', fontSize: '14px', color: 'var(--foreground)' }}>{log.details}</div>
                                            <div className={styles.logMeta} style={{ marginTop: '8px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                                                <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                                {log.timestampStr} · Performed by {log.user}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredLogs.length === 0 && (
                                <div className={styles.emptyMsg} style={{ padding: '80px', textAlign: 'center' }}>
                                    <History size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                                    <p>No activity logs found matching your criteria.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
