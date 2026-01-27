"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const isAdminRequest = pathname?.startsWith('/admin');
    const isHome = pathname === '/';
    const navTheme = isHome ? 'light' : 'dark';

    return (
        <>
            {!isAdminRequest && <Navbar theme={navTheme} />}
            <main>
                {children}
            </main>
            {!isAdminRequest && <Footer />}
        </>
    );
}
