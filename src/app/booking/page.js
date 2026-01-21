"use client";
import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, isBefore, startOfToday } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Users, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import styles from './Booking.module.css';

const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM"
];

export default function BookingPage() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [numPeople, setNumPeople] = useState(1);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBooked, setIsBooked] = useState(false);
    const [isError, setIsError] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);

    // Fetch booked slots for the selected date
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
        try {
            await addDoc(collection(db, 'bookings'), {
                date: format(selectedDate, 'yyyy-MM-dd'),
                time: selectedTime,
                guests: numPeople,
                email: email,
                status: 'confirmed',
                createdAt: Timestamp.now()
            });

            // Send confirmation email using EmailJS (FREE - 200 emails/month)
            // Set up your EmailJS account at https://www.emailjs.com/
            // Then add these to your .env.local:
            // NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
            try {
                await emailjs.send(
                    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
                    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID',
                    {
                        to_email: email,
                        to_name: 'Valued Guest',
                        booking_date: format(selectedDate, 'PPP'),
                        booking_time: selectedTime,
                        guest_count: numPeople,
                        cafe_name: 'Cafe Da-Vina',
                        cafe_address: '107 Astor Terrace, Spring Hill QLD 4000'
                    },
                    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY'
                );
                console.log('Confirmation email sent!');
            } catch (emailError) {
                console.warn('Email sending failed (EmailJS not configured):', emailError);
                // Don't block the booking if email fails
            }

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
            <header className={styles.header}>
                <div className="container">
                    <h1>Make a Reservation</h1>
                    <p>Book your table and enjoy a lovely meal in our cozy environment.</p>
                </div>
            </header>

            <section className="section">
                <div className="container">
                    <div className={styles.bookingGrid}>
                        {/* Step 1: Select Date */}
                        <div className={styles.stepCard}>
                            <div className={styles.stepHeader}>
                                <CalendarIcon className={styles.stepIcon} />
                                <h2>1. Select a Date</h2>
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

                        {/* Step 2: Select Time & Details */}
                        <AnimatePresence>
                            {selectedDate && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={styles.stepCard}
                                >
                                    <div className={styles.stepHeader}>
                                        <Clock className={styles.stepIcon} />
                                        <h2>2. Choose Time & Details</h2>
                                    </div>

                                    <p className={styles.selectedDateInfo}>
                                        Selected: <strong>{format(selectedDate, 'PPP')}</strong>
                                    </p>

                                    <div className={styles.timeGrid}>
                                        {timeSlots.map(time => {
                                            const isFull = bookedSlots.includes(time);
                                            return (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    disabled={isFull}
                                                    className={`${styles.timeButton} ${selectedTime === time ? styles.activeTime : ''} ${isFull ? styles.full : ''}`}
                                                    onClick={() => setSelectedTime(time)}
                                                >
                                                    {time}
                                                    {isFull && <span className={styles.fullStatus}>Full</span>}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {bookedSlots.length === timeSlots.length && (
                                        <div className={styles.fullyBookedMsg}>
                                            <AlertCircle size={20} />
                                            <p>This day is fully booked. Please select another date.</p>
                                        </div>
                                    )}

                                    {selectedTime && (
                                        <form onSubmit={handleSubmit} className={styles.detailsForm}>
                                            <div className={styles.formGroup}>
                                                <label><Users size={16} /> Number of People</label>
                                                <input
                                                    type="number"
                                                    min="1" max="10"
                                                    value={numPeople}
                                                    onChange={(e) => setNumPeople(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label><Mail size={16} /> Email Address</label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    placeholder="your@email.com"
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={isSubmitting}
                                                style={{ width: '100%' }}
                                            >
                                                {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
                                            </button>
                                        </form>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* Confirmation Modal */}
            {isBooked && (
                <div className={styles.modalOverlay}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={styles.modal}
                    >
                        <CheckCircle size={64} color="var(--accent-secondary)" />
                        <h2>Reservation Confirmed!</h2>
                        <p>We've sent a confirmation email to <strong>{email}</strong>.</p>
                        <p>See you on {format(selectedDate, 'PPP')} at {selectedTime}!</p>
                        <button className="btn btn-primary" onClick={() => window.location.href = '/'}>Back to Home</button>
                    </motion.div>
                </div>
            )}

            {isError && (
                <div className={styles.modalOverlay}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={styles.modal}
                    >
                        <AlertCircle size={64} color="var(--accent-tertiary)" />
                        <h2>Something went wrong</h2>
                        <p>We couldn't process your reservation. Please try again later.</p>
                        <button className="btn btn-outline" onClick={() => setIsError(false)}>Close</button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
