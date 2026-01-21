"use client";
import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, isBefore, startOfToday } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Users, Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './Booking.module.css';

const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
    "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM"
];

export default function BookingPage() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [numPeople, setNumPeople] = useState(1);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBooked, setIsBooked] = useState(false);
    const [isError, setIsError] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [bookingId, setBookingId] = useState('');

    useEffect(() => {
        if (selectedDate) {
            const fetchBookings = async () => {
                try {
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    const bookingsRef = collection(db, 'bookings');
                    const q = query(bookingsRef, where('date', '==', dateStr));
                    const querySnapshot = await getDocs(q);
                    const slots = querySnapshot.docs.map(doc => doc.data().time);
                    setBookedSlots(slots);
                } catch (err) {
                    console.error("Error fetching bookings:", err);
                }
            };
            fetchBookings();
        }
    }, [selectedDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime || !email) return;

        setIsSubmitting(true);
        const generatedBookingId = 'DVN-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        try {
            // 1. Create booking in Firestore
            await addDoc(collection(db, 'bookings'), {
                bookingId: generatedBookingId,
                name,
                date: format(selectedDate, 'yyyy-MM-dd'),
                time: selectedTime,
                guests: numPeople,
                email: email,
                status: 'confirmed',
                createdAt: Timestamp.now()
            });

            // 2. Trigger Email via 'mail' collection (Firebase Extension)
            await addDoc(collection(db, 'mail'), {
                to: email,
                message: {
                    subject: `Reservation Confirmed: ${generatedBookingId}`,
                    text: `Hi ${name || 'Guest'}, your table for ${numPeople} at Cafe Da Vina is confirmed for ${format(selectedDate, 'PPP')} at ${selectedTime}.`,
                    html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h1 style="color: #8b5e3c;">Cafe Da Vina</h1>
              <p>Hi <strong>${name || 'Guest'}</strong>,</p>
              <p>Your reservation is confirmed! We look forward to seeing you.</p>
              <div style="background: #f7f3ed; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Ref:</strong> ${generatedBookingId}</p>
                <p><strong>Date:</strong> ${format(selectedDate, 'PPP')}</p>
                <p><strong>Time:</strong> ${selectedTime}</p>
                <p><strong>Guests:</strong> ${numPeople}</p>
              </div>
              <p>Address: 123 Gourmet St, Food City</p>
            </div>
          `,
                }
            });

            setBookingId(generatedBookingId);
            setIsBooked(true);
        } catch (err) {
            console.error("Error creating booking:", err);
            setIsError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isPast = (day) => isBefore(day, startOfToday());

    return (
        <div className={styles.bookingPage}>
            <Navbar />

            <header className={styles.header}>
                <div className="container">
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={18} /> Back to Home
                    </Link>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Reservation
                    </motion.h1>
                    <p>Book your table and enjoy the Mediterranean fusion experience.</p>
                </div>
            </header>

            <div className="container">
                <div className={styles.bookingGrid}>
                    {/* Step 1: Date */}
                    <div className={styles.stepCard}>
                        <div className={styles.stepHeader}>
                            <CalendarIcon size={20} />
                            <h2>Choose Date</h2>
                        </div>
                        <div className={styles.calendarWrapper}>
                            <DayPicker
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={isPast}
                                modifiersClassNames={{
                                    selected: styles.selectedDay
                                }}
                            />
                        </div>
                    </div>

                    {/* Step 2: Details */}
                    <div className={styles.stepCard}>
                        <div className={styles.stepHeader}>
                            <Clock size={20} />
                            <h2>Details & Time</h2>
                        </div>
                        {!selectedDate ? (
                            <p className={styles.prompt}>Please select a date first.</p>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className={styles.timeGrid}>
                                    {timeSlots.map(time => {
                                        const isFull = bookedSlots.includes(time);
                                        return (
                                            <button
                                                key={time}
                                                disabled={isFull}
                                                className={`${styles.timeButton} ${selectedTime === time ? styles.activeTime : ''}`}
                                                onClick={() => setSelectedTime(time)}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </div>

                                <form onSubmit={handleSubmit} className={styles.form}>
                                    <div className={styles.formGroup}>
                                        <label>Name</label>
                                        <input value={name} onChange={e => setName(e.target.value)} required placeholder="Your Name" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Email</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@address.com" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Number of Guests</label>
                                        <select value={numPeople} onChange={e => setNumPeople(e.target.value)}>
                                            {[1, 2, 3, 4, 5, 6, 8].map(n => <option key={n} value={n}>{n} Persons</option>)}
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting || !selectedTime}
                                        style={{ width: '100%', marginTop: '1rem' }}
                                    >
                                        {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isBooked && (
                    <div className={styles.modalOverlay}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={styles.modal}>
                            <CheckCircle size={64} className={styles.successIcon} />
                            <h2>Confirmed!</h2>
                            <p>Reference: <strong>{bookingId}</strong></p>
                            <p>We've sent a confirmation email to {email}.</p>
                            <button className="btn btn-primary" onClick={() => window.location.href = '/'}>Finish</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
