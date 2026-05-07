import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jakarta",
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
    <html lang="en" className={`h-full ${jakarta.variable}`}>
      <body className={`min-h-full flex flex-col bg-[#f8f9fc] ${jakarta.className}`}>
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-100 bg-white py-5 mt-10">
          <p className="text-center text-xs text-gray-400 tracking-wide">
            Demo application — do not enter real patient health information.
          </p>
        </footer>
      </body>
    </html>
  );
}

