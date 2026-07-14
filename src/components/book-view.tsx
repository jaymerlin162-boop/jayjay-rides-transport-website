"use client";

import { useState } from "react";
import { LeftPage, RightPage } from "./tab-content";

const TABS = [
  { key: "rides", label: "Rides" },
  { key: "fares", label: "Fares" },
  { key: "why", label: "Why Us" },
  { key: "contact", label: "Contact" },
];

export function BookView({ onBook }: { onBook: () => void }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("rides");

  function selectTab(key: string) {
    setActiveTab(key);
    if (!open) setOpen(true);
  }

  return (
    <div className="w-full">
      <nav className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => selectTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition sm:text-base ${
              activeTab === tab.key && open
                ? "bg-yellow-400 text-slate-900 shadow-md shadow-yellow-400/30"
                : "bg-white text-slate-700 shadow hover:bg-yellow-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => setOpen(false)}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-yellow-400 transition hover:bg-slate-800 dark:bg-yellow-400 dark:text-slate-900 dark:hover:bg-yellow-300 sm:text-base"
        >
          Cover
        </button>
      </nav>

      <div
        className="relative mx-auto w-full max-w-5xl"
        style={{ height: "clamp(420px, 60vh, 600px)", perspective: "1200px" }}
      >
        <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          <div
            className={`absolute inset-0 flex overflow-hidden rounded-2xl shadow-2xl transition-opacity duration-500 ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="h-full w-1/2 overflow-y-auto border-r border-slate-200 bg-white p-5 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
              <LeftPage tab={activeTab} />
            </div>
            <div className="h-full w-1/2 overflow-y-auto bg-white p-5 sm:p-8 dark:bg-slate-800">
              <RightPage tab={activeTab} onBook={onBook} />
            </div>
          </div>

          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-400 to-yellow-500 p-6 text-center shadow-2xl transition-transform duration-700"
            style={{
              transformOrigin: "left center",
              transform: open ? "rotateY(-180deg)" : "rotateY(0deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <span className="rounded-full bg-slate-900 px-4 py-1 text-xs font-bold uppercase tracking-widest text-yellow-400">
              Student transport
            </span>
            <h1 className="mt-4 text-5xl font-black text-slate-900 sm:text-7xl">
              Jayjay Rides
            </h1>
            <p className="mt-3 max-w-md text-base font-medium text-slate-800 sm:text-lg">
              Affordable tuk-tuks & private taxis for students around campus.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  setActiveTab("rides");
                  setOpen(true);
                }}
                className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-yellow-400 shadow-lg transition hover:scale-105"
              >
                Open the book
              </button>
              <button
                onClick={onBook}
                className="rounded-xl bg-white px-6 py-3 font-bold text-slate-900 shadow-lg transition hover:scale-105"
              >
                Book a ride
              </button>
            </div>
            <p className="mt-6 text-sm font-medium text-slate-800">
              Technical University of Mombasa, Transit Desk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
