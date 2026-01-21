"use client";
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import styles from './Admin.module.css';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (user) {
                fetchDishes();
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const fetchDishes = async () => {
        const querySnapshot = await getDocs(collection(db, "dishes"));
        const dishesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDishes(dishesData);
    };

    const handleLogin = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
    };

    const handleLogout = () => {
        signOut(auth);
    };

    const updateDish = async (index, field, value) => {
        const newDishes = [...dishes];
        newDishes[index][field] = value;
        setDishes(newDishes);
    };

    const saveDish = async (dish) => {
        await setDoc(doc(db, "dishes", dish.id || dish.name.replace(/\s+/g, '-').toLowerCase()), dish);
        alert("Saved!");
    };

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return (
            <div className={styles.loginPage}>
                <h1>Admin Login</h1>
                <button onClick={handleLogin} className="btn btn-primary">Sign in with Google</button>
            </div>
        );
    }

    return (
        <div className={styles.adminPage}>
            <header className={styles.header}>
                <h1>Dashboard</h1>
                <button onClick={handleLogout}>Logout</button>
            </header>

            <main className={styles.content}>
                <h2>Manage Dish Variants</h2>
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
                            <input
                                type="color"
                                value={dish.themeColor}
                                onChange={(e) => updateDish(idx, 'themeColor', e.target.value)}
                            />
                            <input
                                value={dish.sequencePath}
                                onChange={(e) => updateDish(idx, 'sequencePath', e.target.value)}
                                placeholder="Sequence Path"
                            />
                            <button onClick={() => saveDish(dish)} className="btn btn-primary">Save Changes</button>
                        </div>
                    ))}
                    <button className="btn btn-outline" onClick={() => setDishes([...dishes, { name: '', subtitle: '', description: '', themeColor: '#8b5e3c', sequencePath: '' }])}>
                        + Add New Dish
                    </button>
                </div>
            </main>
        </div>
    );
}
