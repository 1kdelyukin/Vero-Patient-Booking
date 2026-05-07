import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";

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
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-100 bg-white py-4 mt-8">
          <p className="text-center text-xs text-gray-400">
            This is a demo application. Do not enter real patient health
            information.
          </p>
        </footer>
      </body>
    </html>
  );
}

