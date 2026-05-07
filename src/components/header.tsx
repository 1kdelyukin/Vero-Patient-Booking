"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 rounded-lg p-1.5">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-lg">Vero Health</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Book Appointment
          </Link>
          <Link
            href="/admin"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
