import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const AppointmentForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [peopleCount, setPeopleCount] = useState(2);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name || !email || !peopleCount || !date || !time) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);

      await addDoc(collection(db, 'appointments'), {
        name,
        email,
        peopleCount,
        date,
        time,
        notes,
        status: 'pending',
        createdAt: serverTimestamp(),
        // These fields can be mapped by the Firebase Trigger Email extension:
        to: [email],
        replyTo: email,
        template: {
          name: 'reservation-confirmation',
          data: {
            name,
            peopleCount,
            date,
            time,
          },
        },
      });

      setSuccessMessage(
        'Your reservation request has been received. A confirmation email will be sent shortly.'
      );
      setName('');
      setEmail('');
      setPeopleCount(2);
      setDate('');
      setTime('');
      setNotes('');

      // Send auto-reply via Trigger Email Extension (mail collection)
      await addDoc(collection(db, 'mail'), {
        to: [email],
        message: {
          subject: 'Reservation Received - Cafe Da Vina',
          html: `
            <div style="font-family: sans-serif; color: #333;">
              <h1 style="text-transform: uppercase;">Reservation Received</h1>
              <p>Dear ${name},</p>
              <p>We have received your requested reservation for <strong>${peopleCount} guest(s)</strong> on <strong>${date} at ${time}</strong>.</p>
              <p>Our concierge team will review your request and confirm shortly.</p>
              <br/>
              <p>Kind Regards,<br/>Cafe Da Vina Team</p>
            </div>
          `
        }
      });

    } catch (err) {
      console.error(err);
      setErrorMessage('Something went wrong. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="appointment" className="relative z-20 bg-black text-white px-8 py-24">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-zinc-500 mb-4">
          Reservation
        </h2>
        <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-8">
          Reserve your gourmet experience.
        </h3>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-950/60 border border-zinc-800 rounded-3xl p-8"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Name*
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-full px-4 py-3 outline-none focus:border-zinc-500 transition text-sm"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Email*
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-full px-4 py-3 outline-none focus:border-zinc-500 transition text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Number of Guests*
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={peopleCount}
              onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
              className="w-full bg-black border border-zinc-800 rounded-full px-4 py-3 outline-none focus:border-zinc-500 transition text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Date*
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-full px-4 py-3 outline-none focus:border-zinc-500 transition text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Time*
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-full px-4 py-3 outline-none focus:border-zinc-500 transition text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-zinc-500 transition text-sm min-h-[80px]"
              placeholder="Dietary requirements, special occasions, or preferences"
            />
          </div>

          <div className="md:col-span-2 flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition"
            >
              {isSubmitting ? 'Sending...' : 'Request Reservation'}
            </button>

            {successMessage && (
              <p className="text-xs text-emerald-400 font-medium">{successMessage}</p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};

export default AppointmentForm;

