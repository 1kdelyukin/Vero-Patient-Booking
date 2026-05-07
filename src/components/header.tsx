"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/80 shadow-sm shadow-gray-100/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200 group-hover:shadow-violet-300 transition-shadow">
            <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5 text-white w-[18px] h-[18px]">
              <path
                d="M10 17s-7-4.35-7-9a5 5 0 0 1 7-4.58A5 5 0 0 1 17 8c0 4.65-7 9-7 9z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-[17px] tracking-tight">
            Vero
            <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
              Health
            </span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              pathname === "/"
                ? "bg-violet-50 text-violet-700"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            )}
          >
            Book
          </Link>
          <Link
            href="/admin"
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              pathname === "/admin"
                ? "bg-violet-50 text-violet-700"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            )}
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

