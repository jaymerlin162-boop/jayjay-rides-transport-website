"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookView } from "@/components/book-view";
import { ThemeToggle } from "@/components/theme-toggle";
import { Phone } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400 text-lg font-black text-slate-900">
              J
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-slate-100">
              Jayjay Rides
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin"
              className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow transition hover:bg-yellow-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:block"
            >
              Admin
            </Link>
            <Link
              href="/register"
              className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow transition hover:bg-yellow-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:block"
            >
              Register
            </Link>
            <a
              href="tel:+254712345678"
              className="hidden items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 shadow transition hover:bg-yellow-300 sm:flex"
            >
              <Phone className="h-4 w-4" /> +254 712 345 678
            </a>
            <button
              onClick={() => router.push("/register")}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-yellow-400 transition hover:bg-slate-800 dark:bg-yellow-400 dark:text-slate-900 dark:hover:bg-yellow-300"
            >
              Book a ride
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
        <BookView onBook={() => router.push("/book")} />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        <p>
          © {new Date().getFullYear()} Jayjay Rides. Technical University of
          Mombasa, Transit Desk.
        </p>
        <p className="mt-1">
          Affordable tuk-tuks &amp; private taxis for students.
        </p>
      </footer>
    </div>
  );
}
