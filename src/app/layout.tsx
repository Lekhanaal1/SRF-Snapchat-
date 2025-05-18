import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SRF Connect - Share Spiritual Moments",
  description: "Connect with fellow devotees, share spiritual moments, and discover the global SRF family",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <Navigation />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
