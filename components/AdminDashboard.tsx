
import React, { useEffect, useState } from 'react';
import { DishVariant } from '../types';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';

interface AdminDashboardProps {
  dishes: DishVariant[];
  onUpdateDishes: (dishes: DishVariant[]) => void;
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ dishes, onUpdateDishes, onClose }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'appointments'>('content');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  type AdminAppointment = {
    id: string;
    name: string;
    email: string;
    peopleCount: number;
    date: string;
    time: string;
    notes?: string;
    status: 'pending' | 'confirmed';
    createdAt?: { seconds: number; nanoseconds: number };
  };

  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsub();
  }, []);

  // Subscribe to appointments in Firestore
  useEffect(() => {
    if (!authUser) return;
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const next: AdminAppointment[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AdminAppointment, 'id'>),
      }));
      setAppointments(next);
    });
    return () => unsub();
  }, [authUser]);

  const handleUpdate = (id: string, field: keyof DishVariant, value: string | number) => {
    const updated = dishes.map(d => d.id === id ? { ...d, [field]: value } : d);
    onUpdateDishes(updated);
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setSaveMessage('');
      const colRef = collection(db, 'dishes');
      const writes = dishes.map((dish) =>
        setDoc(doc(colRef, dish.id), {
          name: dish.name,
          subtitle: dish.subtitle,
          description: dish.description,
          themeColor: dish.themeColor,
          frameCount: dish.frameCount,
          sequenceBaseUrl: dish.sequenceBaseUrl,
          suffix: dish.suffix ?? '',
          isDarkOverride: dish.isDarkOverride ?? false,
        })
      );
      await Promise.all(writes);
      setSaveMessage('Content saved to Firestore.');
    } catch (error) {
      console.error(error);
      setSaveMessage('Failed to save. Check console for details.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(''), 4000);
    }
  };

  const handleAddDish = async () => {
    const newId = `dish-${Date.now()}`;
    const newDish: DishVariant = {
      id: newId,
      name: 'New Dish',
      subtitle: 'Signature Creation',
      description: 'Describe this gourmet experience.',
      themeColor: '#ffffff',
      frameCount: 120,
      sequenceBaseUrl: '',
    };
    onUpdateDishes([...dishes, newDish]);
  };

  const handleStatusChange = async (id: string, status: 'pending' | 'confirmed') => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
    } catch (error) {
      console.error('Failed to update appointment status', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setAuthPassword('');
    } catch (error) {
      console.error(error);
      setAuthError('Login failed. Check credentials.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-zinc-800">
        <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Admin Panel</h2>
            <p className="text-sm opacity-50">Manage content and reservations.</p>
          </div>
          <div className="flex items-center space-x-4">
            {authUser ? (
              <>
                <span className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  {authUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full bg-zinc-800 text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-700"
                >
                  Logout
                </button>
              </>
            ) : null}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {!authUser ? (
          <div className="p-8 space-y-6">
            <p className="text-sm opacity-70">
              Sign in with your admin email and password (created in Firebase Authentication).
            </p>
            <form onSubmit={handleLogin} className="space-y-4 max-w-md">
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 outline-none focus:border-zinc-600 transition text-sm"
                placeholder="admin@cafe-da-vina.com"
              />
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 outline-none focus:border-zinc-600 transition text-sm"
                placeholder="Password"
              />
              {authError && (
                <p className="text-xs text-red-400 font-medium">{authError}</p>
              )}
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-white text-black text-xs font-black uppercase tracking-[0.25em] hover:scale-[1.02] transition"
              >
                Login
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="px-8 pt-4 flex space-x-4 border-b border-zinc-800">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-4 py-3 text-xs font-black uppercase tracking-[0.25em] border-b-2 ${
                  activeTab === 'content'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-500'
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-4 py-3 text-xs font-black uppercase tracking-[0.25em] border-b-2 ${
                  activeTab === 'appointments'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-500'
                }`}
              >
                Appointments
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {activeTab === 'content' && (
                <>
                  {dishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: dish.themeColor }}
                          ></div>
                          <h3 className="text-xl font-bold">{dish.name}</h3>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-zinc-700 font-bold opacity-50">
                          ID: {dish.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold opacity-40">
                            Dish Name
                          </label>
                          <input
                            type="text"
                            value={dish.name}
                            onChange={(e) => handleUpdate(dish.id, 'name', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 outline-none focus:border-zinc-600 transition"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold opacity-40">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            value={dish.subtitle}
                            onChange={(e) =>
                              handleUpdate(dish.id, 'subtitle', e.target.value)
                            }
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 outline-none focus:border-zinc-600 transition"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] uppercase font-bold opacity-40">
                            Description
                          </label>
                          <textarea
                            value={dish.description}
                            onChange={(e) =>
                              handleUpdate(dish.id, 'description', e.target.value)
                            }
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 outline-none focus:border-zinc-600 transition min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold opacity-40">
                            Theme Color Hex
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="color"
                              value={dish.themeColor}
                              onChange={(e) =>
                                handleUpdate(dish.id, 'themeColor', e.target.value)
                              }
                              className="w-10 h-10 bg-transparent border-none outline-none cursor-pointer"
                            />
                            <input
                              type="text"
                              value={dish.themeColor}
                              onChange={(e) =>
                                handleUpdate(dish.id, 'themeColor', e.target.value)
                              }
                              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 outline-none focus:border-zinc-600 transition"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold opacity-40">
                            Sequence Frame Count
                          </label>
                          <input
                            type="number"
                            value={dish.frameCount}
                            onChange={(e) =>
                              handleUpdate(
                                dish.id,
                                'frameCount',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 outline-none focus:border-zinc-600 transition"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleAddDish}
                    className="w-full py-6 border-2 border-dashed border-zinc-800 rounded-2xl opacity-40 hover:opacity-100 hover:border-zinc-600 transition flex items-center justify-center space-x-2"
                  >
                    <i className="fa-solid fa-plus"></i>
                    <span className="text-xs uppercase font-bold tracking-widest">
                      Add New Dish Variant
                    </span>
                  </button>
                </>
              )}

              {activeTab === 'appointments' && (
                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <p className="text-sm text-zinc-400">
                      No appointments yet. New reservations will appear here.
                    </p>
                  ) : (
                    appointments.map((appt) => (
                      <div
                        key={appt.id}
                        className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-bold">
                            {appt.name}{' '}
                            <span className="text-xs text-zinc-400">({appt.email})</span>
                          </p>
                          <p className="text-xs text-zinc-400">
                            {appt.peopleCount} guests • {appt.date} at {appt.time}
                          </p>
                          {appt.notes && (
                            <p className="text-xs text-zinc-500">Notes: {appt.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <select
                            value={appt.status}
                            onChange={(e) =>
                              handleStatusChange(
                                appt.id,
                                e.target.value as 'pending' | 'confirmed'
                              )
                            }
                            className="bg-zinc-900 border border-zinc-700 rounded-full px-3 py-2 text-xs uppercase tracking-[0.2em]"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="p-8 border-t border-zinc-800 bg-zinc-950/50">
              {activeTab === 'content' && (
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:scale-[1.02] disabled:opacity-60 transition"
                >
                  {saving ? 'Saving...' : 'Save All Changes to Firestore'}
                </button>
              )}
              {saveMessage && (
                <p className="mt-3 text-xs text-zinc-400 text-center">{saveMessage}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
