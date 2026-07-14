import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET = process.env.AUTH_SECRET ?? "jayjay-rides-secret";
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@jayjayrides.co.ke";
const DEFAULT_ADMIN_PHONE = process.env.ADMIN_PHONE ?? "+254700000000";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "12345";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const computed = crypto.scryptSync(password, salt, 64).toString("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(computed, "hex")
    );
  } catch {
    return false;
  }
}

function sign(value: string): string {
  const h = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  return `${value}.${h}`;
}

function unsign(token: string): string | null {
  const [val, h] = token.split(".");
  if (!val || !h) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(val).digest("hex");
  if (h.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(h), Buffer.from(expected))) return null;
  return val;
}

export async function createSession(userId: number): Promise<void> {
  const store = await cookies();
  store.set("jjr_session", sign(String(userId)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete("jjr_session");
}

export async function ensureAdminBootstrap(): Promise<void> {
  const [existingAdmin] = await db
    .select({
      id: users.id,
      email: users.email,
      phoneNumber: users.phoneNumber,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.role, "Admin"))
    .limit(1);

  if (!existingAdmin) {
    await db.insert(users).values({
      name: "Jayjay Admin",
      phoneNumber: DEFAULT_ADMIN_PHONE,
      email: DEFAULT_ADMIN_EMAIL,
      role: "Admin",
      passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
    });
    return;
  }

  const passwordMatchesDefault = verifyPassword(
    DEFAULT_ADMIN_PASSWORD,
    existingAdmin.passwordHash
  );
  const isDefaultAdminRecord =
    existingAdmin.email === DEFAULT_ADMIN_EMAIL ||
    existingAdmin.phoneNumber === DEFAULT_ADMIN_PHONE;

  if (!passwordMatchesDefault && isDefaultAdminRecord) {
    await db
      .update(users)
      .set({
        name: "Jayjay Admin",
        email: DEFAULT_ADMIN_EMAIL,
        phoneNumber: DEFAULT_ADMIN_PHONE,
        passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
      })
      .where(eq(users.id, existingAdmin.id));
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get("jjr_session")?.value;
  if (!token) return null;
  const uid = unsign(token);
  if (!uid) return null;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(uid)))
    .limit(1);
  return user ?? null;
}
