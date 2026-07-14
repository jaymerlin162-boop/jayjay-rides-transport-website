import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { bookings, drivers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions";

export const dynamic = "force-dynamic";

function statusClass(s: string) {
  switch (s) {
    case "Accepted":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200";
    case "Completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200";
    case "Cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
  }
}

function paymentClass(status: string) {
  switch (status) {
    case "Paid":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "Failed":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
  }
}

function paymentLabel(status: string) {
  switch (status) {
    case "Paid":
      return "Payment complete";
    case "Failed":
      return "Payment failed";
    default:
      return "Payment pending";
  }
}

export default async function MyRidesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/my-rides");
  if (user.role !== "Student") redirect(user.role === "Admin" ? "/admin" : "/");

  const rows = await db
    .select({
      id: bookings.id,
      rideType: bookings.rideType,
      pickupLocation: bookings.pickupLocation,
      destination: bookings.destination,
      fare: bookings.fare,
      status: bookings.status,
      paymentStatus: bookings.paymentStatus,
      mpesaReceipt: bookings.mpesaReceipt,
      createdAt: bookings.createdAt,
      driverName: drivers.name,
      driverVehicle: drivers.vehicleType,
    })
    .from(bookings)
    .leftJoin(drivers, eq(bookings.driverId, drivers.id))
    .where(eq(bookings.studentId, user.id))
    .orderBy(desc(bookings.createdAt));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
            My Rides
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome, {user.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/book"
            className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-yellow-300"
          >
            Book a ride
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-yellow-400 transition hover:bg-slate-800 dark:bg-yellow-400 dark:text-slate-900"
            >
              Log out
            </button>
          </form>
        </div>
      </div>

      {rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-600 dark:bg-slate-800">
          You have no rides yet.{" "}
          <Link href="/book" className="font-semibold text-yellow-600">
            Book your first ride →
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white p-5 shadow dark:bg-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-slate-900">
                {r.rideType}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusClass(
                  r.status
                )}`}
              >
                {r.status}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <p className="text-slate-500">From</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {r.pickupLocation}
                </p>
              </div>
              <div>
                <p className="text-slate-500">To</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {r.destination}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Fare</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  KES {Number(r.fare)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Driver</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {r.driverName ? `${r.driverName} (${r.driverVehicle})` : "Awaiting dispatch"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${paymentClass(r.paymentStatus)}`}>
                {paymentLabel(r.paymentStatus)}
              </span>
              {r.paymentStatus !== "Paid" && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Complete payment on your phone before the ride can start.
                </span>
              )}
            </div>
            {r.mpesaReceipt && (
              <p className="mt-2 text-xs text-slate-500">M-Pesa: {r.mpesaReceipt}</p>
            )}
            {r.paymentStatus === "Paid" ? (
              <p className="mt-2 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                  ✓
                </span>
                Payment confirmed and receipt email sent to your inbox.
              </p>
            ) : (
              <p className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                  !
                </span>
                Receipt email will be sent after payment completes.
              </p>
            )}
            <p className="mt-2 text-xs text-slate-400">
              Booked {new Date(r.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
