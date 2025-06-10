'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from '../contexts/AuthContext';
import "../styles/globals.css";
import Navigation from "./components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SRF Connect",
  description: "SRF Connect - Live Map for Devotees",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <AuthProvider>
          <Navigation />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
