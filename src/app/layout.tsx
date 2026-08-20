import type { Metadata, Viewport } from "next";
import { Noto_Sans_Tamil, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-tamil",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#064e3b",
};

export const metadata: Metadata = {
  title: "RM Farm World",
  description:
    "மாடு, ஆடு, கோழிப் பண்ணை மேலாண்மை, தானியங்கி தடுப்பூசி அட்டவணை மற்றும் தமிழ் நாட்காட்டி செயலி.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta" className={`${notoTamil.variable} ${inter.variable}`}>
      <body 
        className="bg-stone-50 text-white antialiased min-h-screen flex flex-col"
        style={{ fontFamily: "'Arial Rounded MT Bold', Arial, var(--font-noto-tamil), sans-serif" }}
      >
        {/* Top Navigation Bar */}
        <Navbar />

        {/* Dynamic Page Content */}
        <main className="flex-1">{children}</main>

        {/* Global Tamil Footer */}
        <footer className="bg-emerald-950 text-white border-t border-emerald-900 py-4 text-center text-xs">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-bold text-white text-xs sm:text-sm">
              © 2026 பண்ணை மேலாண்மை செயலி.
            </p>
            <p className="text-white/80 text-[10px] sm:text-[11px] mt-1">
              தமிழ் நாட்காட்டி, தடுப்பூசி நினைவூட்டல்கள் & சினை தேதி கணக்கீடுகளுடன் உருவாக்கப்பட்டது.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}