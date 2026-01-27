import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { email, date, time, guests, name, bookingId } = await req.json();

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Missing email configuration");
      return NextResponse.json({ error: 'Server misconfiguration: Missing email credentials' }, { status: 500 });
    }

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
      subject: 'Reservation Confirmed - Cafe Da Vina',
      html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
                    <div style="background-color: #1a1a1a; color: #d4af37; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0;">Cafe Da Vina</h1>
                        <p style="margin: 5px 0 0; font-size: 14px;">Gourmet Experience</p>
                    </div>
                    <div style="padding: 20px;">
                        <h2 style="color: #22c55e; margin-top: 0;">Reservation Confirmed!</h2>
                        <p>Dear ${name || 'Valued Customer'},</p>
                        <p>We are pleased to inform you that your reservation has been officially <strong>CONFIRMED</strong>. We've reserved a table for you!</p>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #22c55e;">
                            <h3 style="margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 8px;">Reservation Details</h3>
                            <p style="margin: 10px 0;"><strong>Ref ID:</strong> ${bookingId || 'N/A'}</p>
                            <p style="margin: 10px 0;"><strong>Date:</strong> ${date}</p>
                            <p style="margin: 10px 0;"><strong>Time:</strong> ${time}</p>
                            <p style="margin: 10px 0;"><strong>Guests:</strong> ${guests}</p>
                        </div>

                        <p>We look forward to welcoming you for an unforgettable dining experience.</p>
                        <p style="font-size: 14px; color: #666;">If you need to modify or cancel your booking, please reply to this email or contact us directly.</p>
                    </div>
                    <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777; border-radius: 0 0 8px 8px;">
                        <p>&copy; ${new Date().getFullYear()} Cafe Da Vina. All rights reserved.</p>
                        <p>Spring Hill, Queensland</p>
                    </div>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Confirmation email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json({ error: 'Failed to send email', details: error.message }, { status: 500 });
  }
}
