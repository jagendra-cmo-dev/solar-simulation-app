import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'SolarCraft 3D - Interactive Rooftop Solar Design & Shareable Proposal Studio',
  description:
    'Design rooftop solar PV systems in 3D with live sun-path & shadow simulation, PM Surya Ghar subsidy calculations, automated BOM, and client digital quote approval.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className={`${inter.variable} min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans`}>
        {children}
      </body>
    </html>
  );
}
