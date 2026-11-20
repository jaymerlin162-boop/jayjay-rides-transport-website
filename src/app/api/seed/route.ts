import { NextResponse } from "next/server";
import { db } from "@/db";
import { drivers } from "@/db/schema";
import { ensureAdminBootstrap } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureAdminBootstrap();

  const existingDrivers = await db.select().from(drivers);

  if (existingDrivers.length === 0) {
    await db.insert(drivers).values([
      { name: "Omar Njoroge", numberPlate: "KDA 123A", phoneNumber: "+254711111111", vehicleType: "Tuk-tuk" },
      { name: "Daniel Mwangi", numberPlate: "KDB 234B", phoneNumber: "+254722222222", vehicleType: "Taxi" },
      { name: "Kevin Otieno", numberPlate: "KDC 345C", phoneNumber: "+254733333333", vehicleType: "Tuk-tuk" },
    ]);
  } else {
    const driverUpdates = [
      { names: ["KDA 123A", "Omar Tuk-tuk", "Omar Njoroge"], name: "Omar Njoroge", numberPlate: "KDA 123A", vehicleType: "Tuk-tuk" as const },
      { names: ["KDB 234B", "Asha Taxi", "Daniel Mwangi"], name: "Daniel Mwangi", numberPlate: "KDB 234B", vehicleType: "Taxi" as const },
      { names: ["KDC 345C", "Kevo Tuk-tuk", "Kevo Otieno", "Kevin Otieno"], name: "Kevin Otieno", numberPlate: "KDC 345C", vehicleType: "Tuk-tuk" as const },
    ];

    for (const driver of driverUpdates) {
      for (const oldName of driver.names) {
        await db.update(drivers)
          .set({ name: driver.name, numberPlate: driver.numberPlate, vehicleType: driver.vehicleType })
          .where(eq(drivers.name, oldName));
      }
    }
  }

  return NextResponse.json({ ok: true, message: "Seed complete." });
}
