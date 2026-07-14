import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Jayjay Rides — Tuk-tuks & Taxis for Students",
  description:
    "Affordable tuk-tuks and private taxis for students at the Technical University of Mombasa. Book a ride today.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
