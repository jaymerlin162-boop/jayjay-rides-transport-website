import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { BookingForm } from "@/components/booking-form";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/book");
  if (user.role !== "Student") redirect(user.role === "Admin" ? "/admin" : "/");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
          Book a ride
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Signed in as {user.name} · {user.phoneNumber}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800 sm:p-8">
        <BookingForm />
      </div>

      <Link
        href="/"
        className="mt-6 block text-center text-sm font-medium text-slate-500 hover:text-yellow-600 dark:text-slate-400"
      >
        ← Back to site
      </Link>
    </main>
  );
}
