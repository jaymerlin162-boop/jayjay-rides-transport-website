"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/app/actions";
import { MapPin, Car, CreditCard } from "lucide-react";

export function BookingForm() {
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    simulated?: boolean;
    bookingId?: number;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setResult(null);
    startTransition(async () => {
      const res = await createBooking(formData);
      setResult(res);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <Car className="h-4 w-4" /> Ride type
        </span>
        <select
          name="rideType"
          required
          defaultValue="Tuk-tuk"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="Tuk-tuk">Tuk-tuk (KES 80)</option>
          <option value="Taxi">Private Taxi (KES 250)</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <MapPin className="h-4 w-4" /> Pickup location
        </span>
        <input
          name="pickupLocation"
          type="text"
          required
          placeholder="e.g. TUM Hostel A / Transit Desk"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>

      <label className="block">
        <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <MapPin className="h-4 w-4" /> Destination
        </span>
        <input
          name="destination"
          type="text"
          required
          placeholder="e.g. Mombasa Town / Classroom block"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>

      {result && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            result.success
              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
          }`}
        >
          {result.message}
          {result.success && (
            <button
              type="button"
              onClick={() => router.push("/my-rides")}
              className="mt-2 block font-bold underline"
            >
              View my rides →
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-slate-900 shadow-lg shadow-yellow-400/30 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <CreditCard className="h-5 w-5" />
        {pending ? "Processing..." : "Book & pay with M-Pesa"}
      </button>
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        An M-Pesa STK push will be sent to your registered phone number. A confirmation email will be sent to your email address.
      </p>
    </form>
  );
}
