export interface StkResult {
  success: boolean;
  simulated: boolean;
  message: string;
  checkoutRequestId?: string;
  receipt?: string;
}

const BASE =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

function formatPhone(phone: string): string {
  let p = phone.replace(/[^0-9]/g, "");
  if (p.startsWith("0")) p = "254" + p.slice(1);
  if (p.startsWith("254")) return p;
  if (p.startsWith("7") || p.startsWith("1")) return "254" + p;
  return p;
}

async function getAccessToken(): Promise<string | null> {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) return null;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  try {
    const res = await fetch(
      `${BASE}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Initiates an M-Pesa STK push to the customer's phone.
 * If live Daraja credentials are not configured, it runs in a safe
 * "simulated" mode so the booking system still works end-to-end.
 */
export async function initiateStkPush(
  phone: string,
  amount: number,
  accountRef: string
): Promise<StkResult> {
  const token = await getAccessToken();
  const formattedPhone = formatPhone(phone);

  if (!token) {
    return {
      success: true,
      simulated: true,
      message:
        "Simulated M-Pesa STK push (no live Daraja credentials configured). Payment marked as paid for demo.",
    };
  }

  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  if (!shortcode || !passkey) {
    return {
      success: true,
      simulated: true,
      message: "Simulated M-Pesa STK push (shortcode/passkey missing).",
    };
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    "base64"
  );
  const callbackUrl =
    process.env.MPESA_CALLBACK_URL ??
    `${process.env.APP_URL ?? ""}/api/mpesa/callback`;

  try {
    const res = await fetch(`${BASE}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.max(1, Math.round(amount)),
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: accountRef,
        TransactionDesc: "Jayjay Rides fare",
      }),
    });
    const data = (await res.json()) as {
      ResponseCode?: string;
      CheckoutRequestID?: string;
      errorMessage?: string;
    };
    if (data.ResponseCode === "0") {
      return {
        success: true,
        simulated: false,
        message: "STK push sent to your phone. Please enter your M-Pesa PIN.",
        checkoutRequestId: data.CheckoutRequestID,
      };
    }
    return {
      success: false,
      simulated: false,
      message: data.errorMessage ?? "STK push failed.",
    };
  } catch (err) {
    return {
      success: false,
      simulated: false,
      message: "Could not reach M-Pesa. Please try again.",
    };
  }
}
