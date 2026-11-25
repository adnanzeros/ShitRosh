import { Analytics } from '@vercel/analytics/react';
import { Hind_Siliguri, Baloo_Da_2, DM_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const hind = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bn',
  display: 'swap',
});

const baloo = Baloo_Da_2({
  subsets: ['bengali', 'latin'],
  weight: ['600', '800'],
  variable: '--font-display',
  display: 'swap',
});

const dm = DM_Sans({
  subsets: ['latin'],
  variable: '--font-en',
  display: 'swap',
});

export const metadata = {
  title: 'শীতরস — খাঁটি খেজুরের গুড়',
  description:
    'বাংলার ঐতিহ্যবাহী খাঁটি খেজুরের গুড়। ঝোলা, পাটালি ও দানাদার গুড় সরাসরি অর্ডার করুন।',
  icons: {
    icon: '/images/palm-emblem.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FCE3CC',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${hind.variable} ${baloo.variable} ${dm.variable}`}
    >
      <body suppressHydrationWarning>
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}
