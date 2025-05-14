import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans'; // Corrected import path
import { GeistMono } from 'geist/font/mono'; // Corrected import path
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = GeistSans; // Direct usage if variable prop is not needed
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: 'TypeSnap',
  description: 'Upload images, add text, and extract text with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
