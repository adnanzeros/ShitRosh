import { Hind_Siliguri, DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const hind = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-bn", display: "swap" });
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-en", display: "swap" });

export const metadata = {
  title: "শীতরস — খাঁটি খেজুরের গুড়",
  description: "বাংলার ঐতিহ্যবাহী খাঁটি খেজুরের গুড়। ঝোলা, পাটালি ও দানাদার গুড় সরাসরি অর্ডার করুন।",
  icons: { icon: "/images/palm-emblem.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className={`${hind.variable} ${dm.variable}`}>
      <body>{children}<Toaster position="top-center" richColors /></body>
    </html>
  );
}
