import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendBookingEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const callback = body?.Body?.stkCallback;
    if (!callback) return NextResponse.json({ ok: true });

    const resultCode = callback.ResultCode;
    const checkoutRequestId = callback.CheckoutRequestID;
    const items: { Name: string; Value: unknown }[] =
      callback.CallbackMetadata?.Item ?? [];
    const receiptItem = items.find((i) => i.Name === "MpesaReceiptNumber");
    const mpesaReceipt =
      receiptItem && typeof receiptItem.Value === "string"
        ? receiptItem.Value
        : null;

    await db
      .update(bookings)
      .set({
        paymentStatus: resultCode === 0 ? "Paid" : "Failed",
        mpesaReceipt,
      })
      .where(eq(bookings.checkoutRequestId, checkoutRequestId));

    if (resultCode === 0 && mpesaReceipt) {
      const [booking] = await db
        .select({
          id: bookings.id,
          rideType: bookings.rideType,
          pickupLocation: bookings.pickupLocation,
          destination: bookings.destination,
          fare: bookings.fare,
          email: users.email,
          name: users.name,
        })
        .from(bookings)
        .leftJoin(users, eq(bookings.studentId, users.id))
        .where(eq(bookings.checkoutRequestId, checkoutRequestId))
        .limit(1);

      if (booking?.email) {
        await sendBookingEmail(
          booking.email,
          `Payment receipt #${booking.id} · Jayjay Rides`,
          `Hi ${booking.name},\n\nYour payment for booking #${booking.id} has been confirmed.\nRide type: ${booking.rideType}\nPickup: ${booking.pickupLocation}\nDestination: ${booking.destination}\nFare: KES ${booking.fare}\nM-Pesa receipt: ${mpesaReceipt}\n\nThank you for using Jayjay Rides!`,
          `<!DOCTYPE html>
            <html>
              <body style="font-family: Arial, sans-serif; color: #111827; background: #f8fafc; margin: 0; padding: 0;">
                <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
                  <tr>
                    <td style="padding: 24px;">
                      <div style="background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.06);">
                        <h1 style="margin: 0 0 16px; font-size: 22px; color: #0f172a;">Payment receipt</h1>
                        <p style="margin: 0 0 24px; color: #475569;">Hi ${booking.name},</p>
                        <p style="margin: 0 0 24px; color: #475569;">Your M-Pesa payment has been confirmed for booking <strong>#${booking.id}</strong>.</p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Ride type</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">${booking.rideType}</td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Pickup</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">${booking.pickupLocation}</td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Destination</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">${booking.destination}</td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Fare</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">KES ${booking.fare}</td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; font-weight: 600;">M-Pesa receipt</td>
                            <td style="padding: 12px 0;">${mpesaReceipt}</td>
                          </tr>
                        </table>
                        <p style="margin: 0; color: #475569;">Thank you for using Jayjay Rides.</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </body>
            </html>`
        );
      }
    }
  } catch (err) {
    console.error("M-Pesa callback error:", err);
  }
  return NextResponse.json({ ok: true });
}
