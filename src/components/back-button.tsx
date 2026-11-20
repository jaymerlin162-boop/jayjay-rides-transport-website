"use client";

import { useRouter } from "next/navigation";
import React from "react";

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        try {
          router.back();
        } catch {
          window.history.back();
        }
      }}
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 ${className}`}
    >
      ← Back
    </button>
  );
}
