"use client";
import { MapPin, Phone, Clock, Mail, Send } from 'lucide-react';
import styles from './Contact.module.css';

export default function ContactPage() {
    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for your inquiry! We will get back to you soon.');
    };

    return (
        <div className={styles.contactPage}>
            <section className={styles.header}>
                <div className="container">
                    <h1>Contact Us</h1>
                    <p>We'd love to hear from you. Visit us or send a message.</p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className={styles.grid}>
                        <div className={styles.contactInfo}>
                            <div className={styles.infoCard}>
                                <div className={styles.iconWrapper}><MapPin /></div>
                                <div>
                                    <h3>Our Location</h3>
                                    <p>107 Astor Terrace, Spring Hill QLD 4000, Australia</p>
                                </div>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.iconWrapper}><Phone /></div>
                                <div>
                                    <h3>Phone Number</h3>
                                    <p>+61 431 119 221</p>
                                </div>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.iconWrapper}><Clock /></div>
                                <div>
                                    <h3>Opening Hours</h3>
                                    <p>Closed · Opens 5.30 am Thu</p>
                                </div>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.iconWrapper}><Mail /></div>
                                <div>
                                    <h3>Email Address</h3>
                                    <p>hello@cafedavina.com</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formWrapper}>
                            <h2>Send us a Message</h2>
                            <form className={styles.form} onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">Name</label>
                                    <input type="text" id="name" placeholder="John Doe" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email">Email</label>
                                    <input type="email" id="email" placeholder="john@example.com" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="subject">Subject</label>
                                    <input type="text" id="subject" placeholder="Inquiry" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="message">Message</label>
                                    <textarea id="message" rows="5" placeholder="How can we help you?" required></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    <Send size={18} style={{ marginRight: '10px' }} />
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.map}>
                {/* Simplified Map View Placeholder */}
                <div className={styles.mapPlaceholder}>
                    <p>Map View of 107 Astor Terrace, Spring Hill</p>
                </div>
            </section>
        </div>
    );
}
