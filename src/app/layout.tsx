import type { Metadata } from "next";
import { Noto_Sans_Tamil, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

// Google Fonts Setup (தமிழ் மற்றும் ஆங்கில எழுத்துருக்கள்)
const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-tamil",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Metadata (SEO & App Title)
export const metadata: Metadata = {
  title: "பண்ணை மேலாண்மை (Farm Management App)",
  description:
    "மாடு, ஆடு, கோழிப் பண்ணை மேலாண்மை, தானியங்கி தடுப்பூசி அட்டவணை மற்றும் தமிழ் நாட்காட்டி செயலி.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta" className={`${notoTamil.variable} ${inter.variable}`}>
      <body className="font-sans bg-stone-50 text-stone-900 antialiased min-h-screen flex flex-col">
        {/* Top Navigation Bar */}
        <Navbar />

        {/* Dynamic Page Content */}
        <main className="flex-1">{children}</main>

        {/* Global Tamil Footer */}
        <footer className="bg-emerald-950 text-emerald-200 border-t border-emerald-900 py-6 text-center text-xs">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-semibold">
              © 2026 பண்ணை மேலாண்மை செயலி. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.
            </p>
            <p className="text-emerald-400/70 text-[11px] mt-1">
              தமிழ் நாட்காட்டி, தடுப்பூசி நினைவூட்டல்கள் & சினை தேதி கணக்கீடுகளுடன் உருவாக்கப்பட்டது.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}