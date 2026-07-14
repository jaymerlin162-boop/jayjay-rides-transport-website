import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { register } from "@/app/actions";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  "1": "Please fill in all fields.",
  "2": "Password must be at least 4 characters.",
  "3": "Passwords do not match.",
  "4": "An account with that phone or email already exists.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(user.role === "Admin" ? "/admin" : "/my-rides");

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-400 text-2xl font-black text-slate-900">
            J
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Student sign up
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create your Jayjay Rides account
          </p>
        </div>
        <form action={register} className="space-y-3">
          <input
            name="name"
            type="text"
            placeholder="Full name"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            name="phoneNumber"
            type="tel"
            placeholder="Phone e.g. +254712345678"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            name="email"
            type="email"
            placeholder="School email"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            name="confirm"
            type="password"
            placeholder="Confirm password"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 py-2.5 font-bold text-yellow-400 transition hover:bg-slate-800 dark:bg-yellow-400 dark:text-slate-900 dark:hover:bg-yellow-300"
          >
            Create account
          </button>
        </form>
        {error && ERRORS[error] && (
          <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-center text-sm text-red-700 dark:bg-red-900/40 dark:text-red-300">
            {ERRORS[error]}
          </p>
        )}
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-yellow-600">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
