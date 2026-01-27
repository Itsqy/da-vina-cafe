import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req) {
    try {
        const { bookingId, name, date, time, guests, email } = await req.json();

        // 1. Fetch Admin Email from Settings
        const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
        const adminEmail = settingsSnap.exists() ? settingsSnap.data().customerServiceEmail : 'rifqisyatria@gmail.com';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        console.log("DEBUG: Admin Email Target ->", adminEmail);
        console.log("DEBUG: Sending from ->", process.env.EMAIL_USER);

        // 2. Setup Nodemailer Transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 3. Admin Notification Email
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmail,
            subject: `🔔 New Reservation: ${name} (${bookingId})`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
                    <div style="background-color: #1a1a1a; color: #d4af37; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0;">New Reservation Request</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>A new reservation has been made and is currently <strong>PENDING</strong>.</p>
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Ref ID:</strong> ${bookingId}</p>
                            <p><strong>Customer:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Date:</strong> ${date}</p>
                            <p><strong>Time:</strong> ${time}</p>
                            <p><strong>Guests:</strong> ${guests}</p>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${baseUrl}/admin/bookings" style="background-color: #b9653a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review in Dashboard</a>
                        </div>
                    </div>
                </div>
            `,
        };

        // 4. Customer "Pending" Email
        const customerMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Reservation Request Received - Cafe Da Vina`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
                    <div style="background-color: #1a1a1a; color: #d4af37; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0;">Cafe Da Vina</h1>
                    </div>
                    <div style="padding: 20px;">
                        <h2 style="color: #d4a017;">Request Received</h2>
                        <p>Hi ${name || 'Guest'},</p>
                        <p>We've received your reservation request. Our team is currently reviewing availability and will send you a <strong>confirmation email</strong> shortly.</p>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #d4a017;">
                            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #d4a017; font-weight: bold;">PENDING</span></p>
                            <p style="margin: 5px 0;"><strong>Reference:</strong> ${bookingId}</p>
                            <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
                            <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
                            <p style="margin: 5px 0;"><strong>Guests:</strong> ${guests}</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">Note: This is not a final confirmation. Please wait for an approval email before arriving at the cafe.</p>
                    </div>
                </div>
            `,
        };

        // Send both emails
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(customerMailOptions)
        ]);

        return NextResponse.json({ message: 'Notifications sent' }, { status: 200 });
    } catch (error) {
        console.error('Error in notify-admin:', error);
        return NextResponse.json({ error: 'Failed to send notifications', details: error.message }, { status: 500 });
    }
}
