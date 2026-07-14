"use client";

import { FormEvent } from "react";

interface DeleteBookingFormProps {
  bookingId: number;
  action: (formData: FormData) => Promise<void>;
}

export function DeleteBookingForm({ bookingId, action }: DeleteBookingFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!confirm("Are you sure you want to delete this booking? This cannot be undone.")) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} method="post" onSubmit={handleSubmit}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <button
        type="submit"
        className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-red-700"
      >
        Delete
      </button>
    </form>
  );
}
