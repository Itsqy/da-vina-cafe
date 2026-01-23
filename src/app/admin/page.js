"use client";
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import styles from './Admin.module.css';

const INITIAL_DISHES = [
    {
        id: 'salmon-avocado',
        name: "Salmon Avocado",
        subtitle: "FRESH & HEALTHY",
        description: "A delicious blend of rich salmon and creamy avocado, served with a light citrus dressing.",
        themeColor: "#8b5e3c",
        sequencePath: "/avocado-salmon-frame/frame_",
        frameCount: 147
    },
    {
        id: 'grilled-tuna',
        name: "Grilled Tuna",
        subtitle: "LIGHT & SMOKY",
        description: "Perfectly grilled tuna, served with fresh greens and a smoky dressing.",
        themeColor: "#2a9d8f",
        sequencePath: "/avocado-salmon-frame/frame_",
        frameCount: 147
    },
    {
        id: 'mediterranean-salad',
        name: "Mediterranean Salad",
        subtitle: "FRESH & ZESTY",
        description: "A refreshing salad of mixed greens, tomatoes, olives, and feta cheese with a zesty vinaigrette.",
        themeColor: "#e9c46a",
        sequencePath: "/avocado-salmon-frame/frame_",
        frameCount: 147
    }
];

const INITIAL_MENU = [
    {
        id: 'item-1',
        name: 'Eggs on Salmon',
        description: 'Freshly poached eggs served on premium smoked salmon and toasted sourdough bread.',
        price: '$18.50',
        image: '/egg-on-salmon.webp',
        category: 'Breakfast'
    },
    {
        id: 'item-2',
        name: 'Avocado Salmon',
        description: 'Grilled salmon fillet accompanied by creamy avocado slices and a light citrus salad.',
        price: '$21.00',
        image: '/avvocado-salmon.webp',
        category: 'Lunch'
    },
    {
        id: 'item-3',
        name: 'Ham and Toast',
        description: 'Thick slices of honey-glazed ham served with artisan sourdough toast and homemade jam.',
        price: '$15.50',
        image: '/toast-and-ham.webp',
        category: 'Breakfast'
    },
    {
        id: 'item-4',
        name: 'Smashed Avocado',
        description: 'Our signature smashed avocado on sourdough, topped with feta, radish, and a hint of chili.',
        price: '$16.50',
        image: '/smashed-avocado.jpg',
        category: 'Breakfast'
    }
];

const INITIAL_CONFIG = {
    heroTitle: 'READY FOR AN UNFORGETTABLE MEAL?',
    heroDescription: 'Join us at Cafe Da Vina for a modern fusion experience.',
    address: '123 Gourmet St, Food City',
    phone: '+1 234 567 890',
    email: 'hello@cafedavina.com',
    isOpen: true
};

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('dishes');
    const [dishes, setDishes] = useState(INITIAL_DISHES);
    const [menuItems, setMenuItems] = useState(INITIAL_MENU);
    const [siteConfig, setSiteConfig] = useState(INITIAL_CONFIG);
    const [bookings, setBookings] = useState([]);
    const [bookingFilter, setBookingFilter] = useState('recent'); // Default to recent to show data
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (user) {
                fetchAllData();
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const fetchAllData = async () => {
        setFetchError('');
        try {
            // Fetch Dishes
            const dishesSnap = await getDocs(collection(db, "dishes"));
            if (!dishesSnap.empty) {
                setDishes(dishesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }

            // Fetch Menu Items
            const menuSnap = await getDocs(collection(db, "menu_items"));
            if (!menuSnap.empty) {
                setMenuItems(menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }

            // Fetch Site Config
            const configSnap = await getDoc(doc(db, "configs", "site"));
            if (configSnap.exists()) {
                setSiteConfig(configSnap.data());
            }

            // Fetch Bookings
            const bookingsSnap = await getDocs(collection(db, "bookings"));
            setBookings(bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error("Error fetching data:", err);
            setFetchError("Permission Denied or Connection Error. Please check Firestore Rules.");
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError('Invalid email or password. Please try again.');
            console.error(err);
        }
    };

    const handleLogout = () => {
        signOut(auth);
    };

    // Dish logic
    const updateDish = (index, field, value) => {
        const newDishes = [...dishes];
        newDishes[index][field] = value;
        setDishes(newDishes);
    };

    const saveDish = async (dish) => {
        try {
            const id = dish.id || dish.name.replace(/\s+/g, '-').toLowerCase();
            await setDoc(doc(db, "dishes", id), dish);
            alert("Dish saved!");
        } catch (err) {
            alert("Error saving: " + err.message);
        }
    };

    // Menu logic
    const updateMenuItem = (index, field, value) => {
        const newItems = [...menuItems];
        newItems[index][field] = value;
        setMenuItems(newItems);
    };

    const saveMenuItem = async (item) => {
        try {
            const id = item.id || `item-${Date.now()}`;
            await setDoc(doc(db, "menu_items", id), item);
            alert("Menu item saved!");
        } catch (err) {
            alert("Error saving: " + err.message);
        }
    };

    // Config logic
    const saveSiteConfig = async () => {
        try {
            await setDoc(doc(db, "configs", "site"), siteConfig);
            alert("Settings saved!");
        } catch (err) {
            alert("Error saving: " + err.message);
        }
    };

    // Booking management
    const updateBookingStatus = async (id, newStatus) => {
        try {
            await setDoc(doc(db, "bookings", id), { status: newStatus }, { merge: true });
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
            // Optional: alert(`Booking ${newStatus}!`);
        } catch (err) {
            alert("Error updating status: " + err.message);
        }
    };

    // Filtered bookings
    const filteredBookings = bookings.filter(b => {
        if (bookingFilter === 'today') {
            const todayStr = new Date().toISOString().split('T')[0];
            return b.date === todayStr;
        }
        if (bookingFilter === 'date') {
            return b.date === filterDate;
        }
        return true; // recent (all sorted)
    }).sort((a, b) => {
        if (bookingFilter === 'recent') {
            // Sort by createdAt descending
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        }
        // Sort by time for others
        return a.time.localeCompare(b.time);
    });

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
                        {error && <p className={styles.errorMsg}>{error}</p>}
                        <button type="submit" className="btn btn-primary">Login to Dashboard</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminPage}>
            <header className={styles.header}>
                <div>
                    <h1>Da Vina Admin</h1>
                    <nav className={styles.tabs}>
                        <button
                            className={activeTab === 'dishes' ? styles.activeTab : ''}
                            onClick={() => setActiveTab('dishes')}
                        >
                            Hero Variants
                        </button>
                        <button
                            className={activeTab === 'menu' ? styles.activeTab : ''}
                            onClick={() => setActiveTab('menu')}
                        >
                            Menu Cards
                        </button>
                        <button
                            className={activeTab === 'bookings' ? styles.activeTab : ''}
                            onClick={() => setActiveTab('bookings')}
                        >
                            Bookings
                        </button>
                        <button
                            className={activeTab === 'settings' ? styles.activeTab : ''}
                            onClick={() => setActiveTab('settings')}
                        >
                            Site Info
                        </button>
                    </nav>
                </div>
                <button onClick={handleLogout} className="btn btn-outline">Logout</button>
            </header>

            <main className={styles.content}>
                {activeTab === 'dishes' && (
                    <section>
                        <h2>Manage Hero Variants</h2>
                        <div className={styles.dishesList}>
                            {dishes.map((dish, idx) => (
                                <div key={dish.id || idx} className={styles.dishCard}>
                                    <input
                                        value={dish.name}
                                        onChange={(e) => updateDish(idx, 'name', e.target.value)}
                                        placeholder="Dish Name"
                                    />
                                    <input
                                        value={dish.subtitle}
                                        onChange={(e) => updateDish(idx, 'subtitle', e.target.value)}
                                        placeholder="Subtitle"
                                    />
                                    <textarea
                                        value={dish.description}
                                        onChange={(e) => updateDish(idx, 'description', e.target.value)}
                                        placeholder="Description"
                                    />
                                    <div className={styles.inputRow}>
                                        <input
                                            type="color"
                                            value={dish.themeColor}
                                            onChange={(e) => updateDish(idx, 'themeColor', e.target.value)}
                                            title="Theme Color"
                                        />
                                        <input
                                            value={dish.sequencePath}
                                            onChange={(e) => updateDish(idx, 'sequencePath', e.target.value)}
                                            placeholder="WebP Sequence Path"
                                        />
                                        <input
                                            type="number"
                                            value={dish.frameCount}
                                            onChange={(e) => updateDish(idx, 'frameCount', parseInt(e.target.value))}
                                            placeholder="Frame Count"
                                        />
                                    </div>
                                    <button onClick={() => saveDish(dish)} className="btn btn-primary">Save Changes</button>
                                </div>
                            ))}
                            <button className="btn btn-outline" onClick={() => setDishes([...dishes, { name: '', subtitle: '', description: '', themeColor: '#8b5e3c', sequencePath: '', frameCount: 0 }])}>
                                + Add New Hero Variant
                            </button>
                        </div>
                    </section>
                )}

                {activeTab === 'menu' && (
                    <section>
                        <h2>Manage Menu Cards (Landing Page)</h2>
                        <div className={styles.dishesList}>
                            {menuItems.map((item, idx) => (
                                <div key={item.id || idx} className={styles.dishCard}>
                                    <div className={styles.imagePreview}>
                                        <img src={item.image} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px' }} />
                                    </div>
                                    <input
                                        value={item.name}
                                        onChange={(e) => updateMenuItem(idx, 'name', e.target.value)}
                                        placeholder="Item Name"
                                    />
                                    <input
                                        value={item.image}
                                        onChange={(e) => updateMenuItem(idx, 'image', e.target.value)}
                                        placeholder="Image URL (e.g. /egg-on-salmon.webp)"
                                    />
                                    <input
                                        value={item.price}
                                        onChange={(e) => updateMenuItem(idx, 'price', e.target.value)}
                                        placeholder="Price ($18.50)"
                                    />
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => updateMenuItem(idx, 'description', e.target.value)}
                                        placeholder="Description"
                                    />
                                    <input
                                        value={item.category}
                                        onChange={(e) => updateMenuItem(idx, 'category', e.target.value)}
                                        placeholder="Category (Breakfast/Lunch)"
                                    />
                                    <button onClick={() => saveMenuItem(item)} className="btn btn-primary">Save Changes</button>
                                </div>
                            ))}
                            <button className="btn btn-outline" onClick={() => setMenuItems([...menuItems, { name: '', description: '', price: '', image: '', category: '' }])}>
                                + Add New Menu Card
                            </button>
                        </div>
                    </section>
                )}

                {activeTab === 'bookings' && (
                    <section>
                        {fetchError && <p className={styles.errorMsg} style={{ marginBottom: '1rem' }}>{fetchError}</p>}
                        <div className={styles.sectionHeader}>
                            <h2>Reservations</h2>
                            <div className={styles.filterBar}>
                                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={fetchAllData}>Refresh List</button>
                                <button className={bookingFilter === 'today' ? styles.activeFilter : ''} onClick={() => setBookingFilter('today')}>Today</button>
                                <button className={bookingFilter === 'recent' ? styles.activeFilter : ''} onClick={() => setBookingFilter('recent')}>Recently Booked</button>
                                <div className={styles.dateFilter}>
                                    <button className={bookingFilter === 'date' ? styles.activeFilter : ''} onClick={() => setBookingFilter('date')}>By Date:</button>
                                    <input type="date" value={filterDate} onChange={(e) => {
                                        setFilterDate(e.target.value);
                                        setBookingFilter('date');
                                    }} />
                                </div>
                            </div>
                        </div>

                        <div className={styles.bookingTable}>
                            <div className={styles.tableHead}>
                                <span>Ref ID</span>
                                <span>Guest</span>
                                <span>Date & Time</span>
                                <span>People</span>
                                <span>Action</span>
                            </div>
                            {filteredBookings.map((b) => (
                                <div key={b.id} className={styles.tableRow}>
                                    <span className={styles.refId}>{b.bookingId}</span>
                                    <div className={styles.guestInfo}>
                                        <strong>{b.name}</strong>
                                        <span>{b.email}</span>
                                    </div>
                                    <div className={styles.dateTime}>
                                        <strong>{b.date}</strong>
                                        <span>{b.time}</span>
                                    </div>
                                    <span>{b.guests} Pers.</span>
                                    <select
                                        className={
                                            b.status === 'confirmed' ? styles.statusBadgeConfirmed :
                                                b.status === 'cancelled' ? styles.statusBadgeCancelled :
                                                    styles.statusBadgePending
                                        }
                                        value={b.status || 'pending'}
                                        onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            ))}
                            {filteredBookings.length === 0 && (
                                <p className={styles.emptyMsg}>No bookings found for this filter.</p>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'settings' && (
                    <section className={styles.dishCard}>
                        <h2>Site Configuration</h2>
                        <div className={styles.inputGroup}>
                            <label>Hero Welcome Title</label>
                            <input
                                value={siteConfig.heroTitle}
                                onChange={(e) => setSiteConfig({ ...siteConfig, heroTitle: e.target.value })}
                                placeholder="e.g. READY FOR AN UNFORGETTABLE MEAL?"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Hero Welcome Description</label>
                            <textarea
                                value={siteConfig.heroDescription}
                                onChange={(e) => setSiteConfig({ ...siteConfig, heroDescription: e.target.value })}
                                placeholder="Describe the cafe experience..."
                            />
                        </div>
                        <hr style={{ margin: '2rem 0', opacity: 0.1 }} />
                        <div className={styles.inputGroup}>
                            <label>Store Status</label>
                            <select
                                value={siteConfig.isOpen ? 'open' : 'closed'}
                                onChange={(e) => setSiteConfig({ ...siteConfig, isOpen: e.target.value === 'open' })}
                                style={{ background: 'var(--bg-primary)', color: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Address</label>
                            <input
                                value={siteConfig.address}
                                onChange={(e) => setSiteConfig({ ...siteConfig, address: e.target.value })}
                                placeholder="123 Gourmet St, Food City"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Phone</label>
                            <input
                                value={siteConfig.phone}
                                onChange={(e) => setSiteConfig({ ...siteConfig, phone: e.target.value })}
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <input
                                value={siteConfig.email}
                                onChange={(e) => setSiteConfig({ ...siteConfig, email: e.target.value })}
                                placeholder="hello@cafedavina.com"
                            />
                        </div>
                        <button onClick={saveSiteConfig} className="btn btn-primary" style={{ marginTop: '1rem' }}>Save All Settings</button>
                    </section>
                )}
            </main>
        </div>
    );
}

