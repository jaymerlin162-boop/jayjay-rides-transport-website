import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBooking } from "./actions";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { initiateStkPush } from "@/lib/mpesa";
import { sendBookingEmail } from "@/lib/email";

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
  createSession: vi.fn(),
  destroySession: vi.fn(),
  verifyPassword: vi.fn(),
  hashPassword: vi.fn(),
  ensureAdminBootstrap: vi.fn(),
  normalizeEmail: vi.fn((value: string) => value.trim().toLowerCase()),
  normalizePhoneNumber: vi.fn((value: string) => value.trim()),
  getPhoneCandidates: vi.fn((value: string) => [value.trim()]),
}));

vi.mock("@/lib/mpesa", () => ({
  initiateStkPush: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendBookingEmail: vi.fn(),
}));

vi.mock("nodemailer", () => ({
  default: {
    createTestAccount: vi.fn(),
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({}),
    })),
  },
}));

describe("createBooking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a booking and marks simulated M-Pesa payment as paid", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 7,
      name: "Jane Student",
      phoneNumber: "+254712345678",
      email: "jane@example.com",
      role: "Student",
      passwordHash: "hashed",
      createdAt: new Date(),
    });

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 42 }]),
      }),
    } as never);

    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: 42 }]),
      }),
    } as never);

    vi.mocked(initiateStkPush).mockResolvedValue({
      success: true,
      simulated: true,
      receipt: "SIM-ABC123",
    });

    const formData = new FormData();
    formData.set("pickupLocation", "Nairobi CBD");
    formData.set("destination", "Strathmore University");
    formData.set("rideType", "Tuk-tuk");

    const result = await createBooking(formData);

    expect(result.success).toBe(true);
    expect(result.simulated).toBe(true);
    expect(result.bookingId).toBe(42);
    expect(result.message).toContain("Booking #42 created");
    expect(initiateStkPush).toHaveBeenCalledWith(
      "+254712345678",
      80,
      "JJR-42"
    );
    expect(sendBookingEmail).toHaveBeenCalled();
  });
});
