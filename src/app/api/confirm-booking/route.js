import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { email, date, time, guests, name } = await req.json();

    console.log("Attempting to send email to:", email);
    console.log("Using Email User:", process.env.EMAIL_USER);
    console.log("Email Pass is Set:", !!process.env.EMAIL_PASS);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Missing email configuration");
      return NextResponse.json({ error: 'Server misconfiguration: Missing email credentials' }, { status: 500 });
    }

    // Create a transporter using Gmail or your preferred SMTP service
    // Ensure you have "App Password" generated if using Gmail (2-Step Verification)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Booking Confirmation - Cafe Da Vina',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1a1a1a; color: #d4af37; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Cafe Da Vina</h1>
            <p style="margin: 5px 0 0; font-size: 14px;">Gourmet Experience</p>
          </div>
          <div style="padding: 20px;">
            <h2 style="color: #4CAF50; margin-top: 0;">Booking Confirmed!</h2>
            <p>Dear ${name || 'Valued Customer'},</p>
            <p>We are pleased to inform you that your reservation request has been confirmed.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; border-bottom: 2px solid #ddd; padding-bottom: 5px;">Reservation Details</h3>
              <p style="margin: 10px 0;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 10px 0;"><strong>Time:</strong> ${time}</p>
              <p style="margin: 10px 0;"><strong>Guests:</strong> ${guests}</p>
            </div>

            <p>We look forward to welcoming you for an unforgettable dining experience.</p>
            <p>If you need to modify or cancel your booking, please contact us directly.</p>
          </div>
          <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>&copy; ${new Date().getFullYear()} Cafe Da Vina. All rights reserved.</p>
            <p>Spring Hill</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json({ error: 'Failed to send email', details: error.message }, { status: 500 });
  }
}
