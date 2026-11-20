import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { login } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getCurrentUser();
  // Allow Admins to reach the login page so they can sign in as a different account.
  if (user && user.role === "Student") redirect("/my-rides");

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-400 text-2xl font-black text-slate-900">
            J
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Sign in
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Access your Jayjay Rides account
          </p>
        </div>
        <form action={login} className="space-y-4">
          <input
            name="identifier"
            type="text"
            placeholder="Phone or email"
            autoFocus
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 py-2.5 font-bold text-yellow-400 transition hover:bg-slate-800 dark:bg-yellow-400 dark:text-slate-900 dark:hover:bg-yellow-300"
          >
            Sign in
          </button>
        </form>
        {error && (
          <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-center text-sm text-red-700 dark:bg-red-900/40 dark:text-red-300">
            Invalid credentials. Please try again.
          </p>
        )}
        <Link
          href="/"
          className="mt-4 block text-center text-sm font-medium text-slate-500 hover:text-yellow-600 dark:text-slate-400"
        >
          ← Back to site
        </Link>
      </div>
    </main>
  );
}
