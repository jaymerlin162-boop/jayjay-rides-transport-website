import { NextResponse } from "next/server";
import { db } from "@/db";
import { drivers } from "@/db/schema";
import { ensureAdminBootstrap } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureAdminBootstrap();

  const existingDrivers = await db.select().from(drivers).limit(1);
  if (existingDrivers.length === 0) {
    await db.insert(drivers).values([
      { name: "Omar Tuk-tuk", phoneNumber: "+254711111111", vehicleType: "Tuk-tuk" },
      { name: "Asha Taxi", phoneNumber: "+254722222222", vehicleType: "Taxi" },
      { name: "Kevo Tuk-tuk", phoneNumber: "+254733333333", vehicleType: "Tuk-tuk" },
    ]);
  }

  return NextResponse.json({ ok: true, message: "Seed complete." });
}
