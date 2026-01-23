import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: 'Cafe Da-Vina | Cozy & Delicious Experience',
  description: 'A lovely place for a delightful meal, serving comforting and tasty food in a cozy and inviting environment in Spring Hill.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
