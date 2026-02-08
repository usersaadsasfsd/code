'use client'; // This directive is necessary for client-side components in App Router

import './globals.css';
import type { Metadata } from 'next'; // Keep this if you have metadata in the same file
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import { ClientLayout } from '@/components/layout/ClientLayout'; // Make sure this path is correct
import { Toaster } from '@/components/ui/toaster'; // Assuming you have a toaster
import { useEffect } from 'react'; // Import useEffect


const inter = Inter({ subsets: ['latin'] });

// If you have Metadata defined here, you should separate it into a static export:
// export const metadata: Metadata = {
//   title: 'Countryroof - Lead Management System',
//   description: 'Comprehensive real estate lead management and analytics platform',
// };


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Register the Firebase Messaging Service Worker
    // This should point to your public/firebase-messaging-sw.js file
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Firebase Messaging Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.error('Firebase Messaging Service Worker registration failed:', error);
        });
    }
  }, []); // Run once on mount

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
        <Toaster /> {/* Ensure your Toaster component is rendered */}
      </body>
    </html>
  );
}
