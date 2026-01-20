<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Cafe Da Vina – Firebase + Vercel Setup

### 1. Install dependencies

- **Install packages**

```bash
npm install
```

This app is a Vite + React frontend with Firebase on the backend (Firestore + Auth).

### 2. Firebase configuration

- **Create a Firebase project**
  - In the Firebase console, create a new project and enable:
    - Firestore Database
    - Authentication (Email/Password)

- **Create a Web App in Firebase**
  - Register a web app and copy the config values.

- **Set Vite env vars**
  - Create a `.env.local` file for local development:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

  - In Vercel, add the same keys under **Project Settings → Environment Variables**.

### 3. Firestore collections

- **Dishes content**
  - Create a `dishes` collection.
  - Each document ID should match a `DishVariant.id` (for existing demo content, you can manually create docs using the current IDs), with fields:
    - `name` (string)
    - `subtitle` (string)
    - `description` (string)
    - `themeColor` (string, e.g. `#ffffff`)
    - `frameCount` (number)
    - `sequenceBaseUrl` (string)
    - `suffix` (string, optional)
    - `isDarkOverride` (boolean, optional)

- **Appointments**
  - Appointments are written to an `appointments` collection by the `AppointmentForm` component with fields:
    - `name`, `email`, `peopleCount`, `date`, `time`, `notes`, `status`, `createdAt`
    - plus fields used by the Trigger Email extension: `to`, `replyTo`, `template`

### 4. Trigger Email (Firestore) auto-reply

- In the Firebase console, go to **Extensions** and install the **Trigger Email** extension.
- Configure it to:
  - Watch the `appointments` collection.
  - Use the `to` field for the recipient and `replyTo` for reply address.
  - Use `template.name` and `template.data` for the email body (for example, template `reservation-confirmation`).
- After installation, every new appointment document created from the frontend will trigger the extension and send an automatic confirmation email.

### 5. Admin dashboard / authentication

- In Firebase Authentication, create an **Email/Password** user that will be your admin.
- The in-app `AdminDashboard` modal (opened via the navbar) uses:
  - Email/password login (Firebase Auth).
  - **Content tab**: edit dishes and save them back to the `dishes` collection.
  - **Appointments tab**: view reservations from `appointments` and update their `status` (`pending` / `confirmed`).
- For stronger protection, configure Firestore Security Rules so that only authenticated admin users can read/write `dishes` and `appointments`.

### 6. Run locally

- **Development**

```bash
npm run dev
```

### 7. Deploy to Vercel

- Push this project to GitHub (or connect directly).
- In Vercel:
  - Import the project.
  - Set all `VITE_FIREBASE_*` env vars in **Project Settings → Environment Variables**.
  - Deploy.

Vercel will serve the Vite-built React frontend, which talks directly to Firebase (Firestore + Auth + Trigger Email extension) for backend capabilities.
# da-vina-cafe
