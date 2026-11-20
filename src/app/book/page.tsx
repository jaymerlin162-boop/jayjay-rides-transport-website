import { redirect } from "next/navigation";
import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { getCurrentUser } from "@/lib/auth";
import { BookingForm } from "@/components/booking-form";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/book");

  // Check SMTP environment so we can warn when email sending isn't configured.
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.FROM_EMAIL;
  const smtpConfigured = Boolean(
    smtpHost && smtpUser && smtpPass && fromEmail && !String(smtpPass).includes("YOUR_")
  );

  // Don't immediately redirect Admins — show a short notice so Admins can still reach this page.
  if (user.role !== "Student") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Book a ride</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Signed in as {user.name} · {user.phoneNumber}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800 sm:p-8">
          {!smtpConfigured && (
            <div className="mb-4 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4 text-sm text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-200">
              <strong>Email not configured:</strong> SMTP settings are missing or use placeholder values. Booking confirmation emails may not be sent.
              <div className="mt-2 text-xs text-yellow-800 dark:text-yellow-200">
                <div>SMTP_HOST: {smtpHost ? "set" : "unset"}</div>
                <div>SMTP_USER: {smtpUser ? "set" : "unset"}</div>
                <div>SMTP_PASS: {smtpPass ? "set" : "unset"}</div>
                <div>FROM_EMAIL: {fromEmail ? "set" : "unset"}</div>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-slate-700 dark:text-slate-300">
            Your account is an Admin account. Bookings must be made from a Student account.
            Use the <a href="/admin" className="font-bold text-yellow-600">Admin panel</a> to manage bookings or create a student account via the registration form below.
          </p>
        </div>

        <div className="mt-6 text-center">
          <a href="/register" className="font-semibold text-yellow-600">Create a student account →</a>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Book a ride</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Signed in as {user.name} · {user.phoneNumber}</p>
          </div>
        </div>
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
