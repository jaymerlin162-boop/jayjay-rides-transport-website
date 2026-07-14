import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { bookings, drivers, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { assignDriver, setBookingStatus, deleteBooking, logout } from "@/app/actions";
import { DeleteBookingForm } from "@/components/delete-booking-form";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = ["Pending", "Accepted", "Completed", "Cancelled"] as const;

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

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "Admin") {
    redirect(user.role === "Student" ? "/my-rides" : "/");
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [todayAgg] = await db
    .select({ count: sql`count(*)` })
    .from(bookings)
    .where(sql`${bookings.createdAt} >= ${startOfToday}`);
  const [activeAgg] = await db
    .select({ count: sql`count(*)` })
    .from(drivers)
    .where(eq(drivers.isAvailable, true));
  const [revAgg] = await db
    .select({ sum: sql`coalesce(sum(${bookings.fare}),0)` })
    .from(bookings)
    .where(eq(bookings.paymentStatus, "Paid"));
  const [pendingAgg] = await db
    .select({ count: sql`count(*)` })
    .from(bookings)
    .where(eq(bookings.status, "Pending"));

  const pendingBookings = await db
    .select()
    .from(bookings)
    .where(eq(bookings.status, "Pending"))
    .orderBy(desc(bookings.createdAt));
  const allBookings = await db
    .select()
    .from(bookings)
    .orderBy(desc(bookings.createdAt))
    .limit(50);
  const driverList = await db.select().from(drivers).orderBy(drivers.name);
  const studentRows = await db.select().from(users);

  const studentMap = new Map(studentRows.map((s) => [s.id, s]));
  const driverMap = new Map(driverList.map((d) => [d.id, d]));
  const availableDrivers = driverList.filter((d) => d.isAvailable);

  const stats = [
    { label: "Bookings today", value: String(todayAgg?.count ?? 0), cls: "text-slate-900 dark:text-slate-100" },
    { label: "Pending", value: String(pendingAgg?.count ?? 0), cls: "text-amber-600 dark:text-amber-400" },
    { label: "Active drivers", value: String(activeAgg?.count ?? 0), cls: "text-blue-600 dark:text-blue-400" },
    { label: "Revenue (Paid)", value: `KES ${Number(revAgg?.sum ?? 0)}`, cls: "text-green-600 dark:text-green-400" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
            Admin · Dispatch
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage rides, drivers and payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow hover:bg-yellow-50 dark:bg-slate-800 dark:text-slate-200"
          >
            Back to site
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

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-4 text-center shadow dark:bg-slate-800">
            <div className={`text-2xl font-black ${s.cls}`}>{s.value}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch panel */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-slate-100">
          Dispatch panel · Pending requests
        </h2>
        {pendingBookings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-600 dark:bg-slate-800">
            No pending ride requests right now.
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {pendingBookings.map((b) => {
            const student = studentMap.get(b.studentId);
            return (
              <div key={b.id} className="rounded-2xl bg-white p-5 shadow dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-slate-900">
                    {b.rideType}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    KES {Number(b.fare)}
                  </span>
                </div>
                <p className="mt-3 text-slate-900 dark:text-slate-100">
                  <span className="font-medium">{b.pickupLocation}</span> →{" "}
                  <span className="font-medium">{b.destination}</span>
                </p>
                <p className="text-sm text-slate-500">
                  {student ? `${student.name} · ${student.phoneNumber}` : `Student #${b.studentId}`}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <form action={assignDriver} className="flex flex-1 items-center gap-2">
                    <input type="hidden" name="bookingId" value={b.id} />
                    <select
                      name="driverId"
                      required
                      defaultValue=""
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value="" disabled>
                        Assign driver…
                      </option>
                      {availableDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.vehicleType})
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-yellow-400 transition hover:bg-slate-800 dark:bg-yellow-400 dark:text-slate-900"
                    >
                      Assign
                    </button>
                  </form>
                  <DeleteBookingForm bookingId={b.id} action={deleteBooking} />
                </div>
                {availableDrivers.length === 0 && (
                  <p className="mt-2 text-xs text-red-600">No available drivers.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* All bookings */}
      <section>
        <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-slate-100">
          All bookings
        </h2>
        <div className="overflow-x-auto rounded-2xl bg-white shadow dark:bg-slate-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-yellow-400 text-slate-900">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Fare</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {allBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No bookings yet.
                  </td>
                </tr>
              )}
              {allBookings.map((b) => {
                const student = studentMap.get(b.studentId);
                const driver = b.driverId ? driverMap.get(b.driverId) : undefined;
                return (
                  <tr key={b.id} className="align-top">
                    <td className="px-4 py-3 font-mono text-slate-500">{b.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {student?.name ?? `#${b.studentId}`}
                      </div>
                      <div className="text-xs text-slate-500">{student?.phoneNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900 dark:text-slate-100">{b.pickupLocation}</div>
                      <div className="text-slate-500">→ {b.destination}</div>
                      <div className="text-xs text-slate-500">{b.rideType}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {driver ? `${driver.name}` : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      KES {Number(b.fare)}
                      <div className="text-xs text-slate-500">{b.paymentStatus}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <form action={setBookingStatus} className="flex items-center gap-2">
                          <input type="hidden" name="bookingId" value={b.id} />
                          <select
                            name="status"
                            defaultValue={b.status}
                            className={`rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold ${statusClass(
                              b.status
                            )} dark:border-slate-600 dark:bg-slate-900`}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="text-slate-900">
                                {opt}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-bold text-yellow-400 transition hover:bg-slate-800 dark:bg-yellow-400 dark:text-slate-900"
                          >
                            Save
                          </button>
                        </form>
                        <DeleteBookingForm bookingId={b.id} action={deleteBooking} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
