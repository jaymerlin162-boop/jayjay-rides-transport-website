"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { db } from "@/db";
import { users, drivers, bookings } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import {
  getCurrentUser,
  createSession,
  destroySession,
  verifyPassword,
  hashPassword,
  ensureAdminBootstrap,
} from "@/lib/auth";
import { initiateStkPush } from "@/lib/mpesa";
import { sendBookingEmail } from "@/lib/email";

export type ActionResult = { success: boolean; message: string };

/* ----------------------------- Auth ----------------------------- */

export async function login(formData: FormData): Promise<void> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!identifier || !password) {
    redirect("/login?error=1");
  }

  await ensureAdminBootstrap();

  const [user] = await db
    .select()
    .from(users)
    .where(or(eq(users.phoneNumber, identifier), eq(users.email, identifier)))
    .limit(1);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect("/login?error=1");
  }

  await createSession(user.id);
  if (user.role === "Admin") redirect("/admin");
  redirect("/my-rides");
}

export async function register(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!name || !phoneNumber || !email || !password) {
    redirect("/register?error=1");
  }
  if (password.length < 4) redirect("/register?error=2");
  if (password !== confirm) redirect("/register?error=3");

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.phoneNumber, phoneNumber), eq(users.email, email)))
    .limit(1);

  if (existing.length > 0) redirect("/register?error=4");

  const [user] = await db
    .insert(users)
    .values({
      name,
      phoneNumber,
      email,
      role: "Student",
      passwordHash: hashPassword(password),
    })
    .returning();

  await createSession(user.id);
  redirect("/my-rides");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}

/* --------------------------- Booking --------------------------- */

function computeFare(rideType: string): number {
  const base = rideType === "Taxi" ? 250 : 80;
  return base;
}

async function sendCompanyEmail(b: {
  id: number;
  name: string;
  phone: string;
  rideType: string;
  pickup: string;
  destination: string;
  fare: number;
}) {
  try {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    let transporter: nodemailer.Transporter;
    if (host && user && pass) {
      transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user, pass },
      });
    } else {
      const test = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: test.user, pass: test.pass },
      });
    }
    await transporter.sendMail({
      from: `"Jayjay Rides" <no-reply@jayjayrides.co.ke>`,
      to: process.env.COMPANY_EMAIL ?? "bookings@jayjayrides.co.ke",
      subject: `New ${b.rideType} booking #${b.id} from ${b.name}`,
      text: `New booking #${b.id}\nStudent: ${b.name}\nPhone: ${b.phone}\nRide: ${b.rideType}\nFrom: ${b.pickup}\nTo: ${b.destination}\nFare: KES ${b.fare}`,
    });
  } catch (err) {
    console.error("Booking email failed:", err);
  }
}


export async function createBooking(
  formData: FormData
): Promise<ActionResult & { simulated?: boolean; bookingId?: number }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Please log in to book a ride." };
  }
  if (user.role !== "Student") {
    return { success: false, message: "Only student accounts may book rides." };
  }

  const pickupLocation = String(formData.get("pickupLocation") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();
  const rideType = String(formData.get("rideType") ?? "") as "Tuk-tuk" | "Taxi";

  if (!pickupLocation || !destination || !rideType) {
    return { success: false, message: "Please fill in all fields." };
  }

  const fare = computeFare(rideType);
  const checkoutRequestId = crypto.randomUUID();

  const [booking] = await db
    .insert(bookings)
    .values({
      studentId: user.id,
      pickupLocation,
      destination,
      rideType,
      fare: String(fare),
      checkoutRequestId,
    })
    .returning();

  const stk = await initiateStkPush(user.phoneNumber, fare, `JJR-${booking.id}`);

  if (stk.success && stk.simulated) {
    await db
      .update(bookings)
      .set({
        paymentStatus: "Paid",
        mpesaReceipt: stk.receipt ?? `SIM-${checkoutRequestId.slice(0, 8)}`,
      })
      .where(eq(bookings.id, booking.id));
  }

  await sendCompanyEmail({
    id: booking.id,
    name: user.name,
    phone: user.phoneNumber,
    rideType,
    pickup: pickupLocation,
    destination,
    fare,
  });

  await sendBookingEmail(
    user.email,
    `Booking confirmation #${booking.id} · Jayjay Rides`,
    `Hi ${user.name},\n\nYour booking has been created successfully:\nBooking ID: ${booking.id}\nRide type: ${rideType}\nPickup: ${pickupLocation}\nDestination: ${destination}\nFare: KES ${fare}\n\nComplete payment on your phone when the M-Pesa prompt arrives.\n\nThank you for using Jayjay Rides!`,
    `<!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; color: #1f2937;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
            <h2 style="color: #111827;">Booking Confirmation</h2>
            <p>Hi ${user.name},</p>
            <p>Your ride booking has been created successfully.</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Booking ID:</td>
                <td style="padding: 8px 0;">${booking.id}</td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 8px 0; font-weight: bold;">Ride type:</td>
                <td style="padding: 8px 0;">${rideType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Pickup:</td>
                <td style="padding: 8px 0;">${pickupLocation}</td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 8px 0; font-weight: bold;">Destination:</td>
                <td style="padding: 8px 0;">${destination}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Fare:</td>
                <td style="padding: 8px 0;">KES ${fare}</td>
              </tr>
            </table>
            <p>Please complete payment on your phone when the M-Pesa prompt arrives.</p>
            <p>Thank you for using Jayjay Rides!</p>
          </div>
        </body>
      </html>`
  );

  return {
    success: stk.success,
    simulated: stk.simulated,
    bookingId: booking.id,
    message: stk.simulated
      ? `Booking #${booking.id} created. (Simulated M-Pesa payment approved.)`
      : stk.success
      ? `Booking #${booking.id} created and STK push sent to ${user.phoneNumber}. Complete payment on your phone.`
      : `Booking #${booking.id} created, but the payment request could not be sent. Please try again.`,
  };
}

/* --------------------------- Admin ----------------------------- */

export async function assignDriver(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (user?.role !== "Admin") redirect("/login");

  const bookingId = Number(formData.get("bookingId"));
  const driverId = Number(formData.get("driverId"));
  if (!bookingId || !driverId) return;

  await db
    .update(bookings)
    .set({ driverId, status: "Accepted" })
    .where(eq(bookings.id, bookingId));

  await db
    .update(drivers)
    .set({ isAvailable: false })
    .where(eq(drivers.id, driverId));

  revalidatePath("/admin");
}

export async function setBookingStatus(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (user?.role !== "Admin") redirect("/login");

  const bookingId = Number(formData.get("bookingId"));
  const status = String(formData.get("status") ?? "") as
    | "Pending"
    | "Accepted"
    | "Completed"
    | "Cancelled";
  if (!bookingId || !status) return;

  const [updated] = await db
    .update(bookings)
    .set({ status })
    .where(eq(bookings.id, bookingId))
    .returning({ driverId: bookings.driverId });

  if ((status === "Completed" || status === "Cancelled") && updated?.driverId) {
    await db
      .update(drivers)
      .set({ isAvailable: true })
      .where(eq(drivers.id, updated.driverId));
  }

  revalidatePath("/admin");
}

export async function deleteBooking(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (user?.role !== "Admin") redirect("/login");

  const bookingId = Number(formData.get("bookingId"));
  if (!bookingId) return;

  const [booking] = await db
    .select({ driverId: bookings.driverId })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  await db.delete(bookings).where(eq(bookings.id, bookingId));

  if (booking?.driverId) {
    await db
      .update(drivers)
      .set({ isAvailable: true })
      .where(eq(drivers.id, booking.driverId));
  }

  revalidatePath("/admin");
}
