import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jakarta",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["700"],
  style: ["italic"],
  display: "swap",
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Vero Health – Patient Booking",
  description: "Book an appointment with a Vero Health physician.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${jakarta.variable} ${lora.variable}`}>
      <body className={`min-h-full flex flex-col ${jakarta.className}`} style={{ background: 'linear-gradient(150deg, #c8e9f6 0%, #dfd0ef 50%, #f8e6d8 100%)', backgroundAttachment: 'fixed' }}>
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/30 py-5 mt-10">
          <p className="text-center text-xs text-gray-500/60 tracking-wide">
            Demo application — do not enter real patient health information.
          </p>
        </footer>
      </body>
    </html>
  );
}

