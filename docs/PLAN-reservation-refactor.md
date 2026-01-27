# PLAN: Reservation Workflow Refactor

This plan outlines the refactor of the reservation system to ensure a professional, multi-step notification flow using Nodemailer and Firestore.

## 🛠 Prerequisites
- [x] Node.js and Next.js (current)
- [x] Firestore configuration (current)
- [x] Nodemailer credentials in `.env.local`

## 🏗 Phase 1: Removal of EmailJS & Cleanup
- [ ] Uninstall `@emailjs/browser` (optional but recommended for zero bloat).
- [ ] Remove EmailJS environment variables from `.env.local`.
- [ ] Identify and remove any remaining EmailJS imports in the codebase.

## 🏗 Phase 2: Refactor Customer Booking Trigger
Update `src/app/booking/page.js`.
- [ ] **Remove** the direct `addDoc(collection(db, 'mail'), ...)` call (which used the Firestore extension).
- [ ] **Create** a new API route `src/app/api/notify-admin/route.js`.
- [ ] **Logic**: After saving to Firestore (status: 'pending'):
    1. Fetch `customerServiceEmail` from `settings/global` doc in Firestore.
    2. Call `api/notify-admin` with booking details.
    3. The API will use Nodemailer to send BOTH:
        - **Admin**: "New Reservation" notification with CTA to Admin Dashboard.
        - **Customer**: "Request Received" confirmation (Pending).

## 🏗 Phase 3: Create Admin Notification API
Create `src/app/api/notify-admin/route.js`.
- [ ] **Features**:
    - [ ] Securely fetch Nodemailer config from environment.
    - [ ] Dynamic recipient (Admin email from Firestore).
    - [ ] **Admin Email Template**:
        - Subject: 🔔 New Reservation at Cafe Da Vina
        - Body: Guest details + "Review in Dashboard" button linking to `/admin/bookings`.
    - [ ] **Customer Email Template**:
        - Subject: We've received your request!
        - Body: Detailed summary + "Pending" status update.

## 🏗 Phase 4: Refactor Admin Confirmation Logic
Update `src/app/admin/bookings/page.js`.
- [ ] Ensure the "Confirm" button triggers the existing `api/confirm-booking` route.
- [ ] Update `src/app/api/confirm-booking/route.js` to refine the template for a "Confirmed" status (Nodemailer based).

## 🧪 Phase 5: Verification & Testing
- [ ] **Step 1**: Make a reservation as a customer -> Verify Admin receives email.
- [ ] **Step 2**: Check Customer receives "Pending" email.
- [ ] **Step 3**: Admin confirms in Dashboard -> Verify Customer receives "Confirmed" email.
- [ ] **Step 4**: Verify status changes reflected in Firestore.

## 🚀 Deployment Notes
- Ensure `EMAIL_USER` and `EMAIL_PASS` are correctly set in the production environment.
- Verify that `NEXT_PUBLIC_BASE_URL` is set to your production domain for correct CTA links.
