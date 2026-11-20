import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  numeric,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["Student", "Driver", "Admin"]);
export const rideTypeEnum = pgEnum("ride_type", ["Tuk-tuk", "Taxi"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "Pending",
  "Accepted",
  "Completed",
  "Cancelled",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: roleEnum("role").notNull().default("Student"),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  numberPlate: varchar("number_plate", { length: 20 }),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  vehicleType: rideTypeEnum("vehicle_type").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),
  driverId: integer("driver_id"),
  pickupLocation: varchar("pickup_location", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  rideType: rideTypeEnum("ride_type").notNull(),
  fare: numeric("fare", { precision: 10, scale: 2 }).notNull(),
  status: bookingStatusEnum("status").notNull().default("Pending"),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("Unpaid"),
  mpesaReceipt: varchar("mpesa_receipt", { length: 50 }),
  checkoutRequestId: varchar("checkout_request_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Driver = typeof drivers.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
