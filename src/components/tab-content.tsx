"use client";

import {
  Bike,
  Clock,
  ShieldCheck,
  Users,
  Phone,
  Mail,
  MapPin,
  Star,
  CreditCard,
} from "lucide-react";
import { TukTukIcon, TaxiIcon } from "./vehicle-icons";

export function LeftPage({ tab }: { tab: string }) {
  switch (tab) {
    case "fares":
      return <FaresLeft />;
    case "why":
      return <WhyLeft />;
    case "contact":
      return <ContactLeft />;
    case "rides":
    default:
      return <RidesLeft />;
  }
}

export function RightPage({ tab, onBook }: { tab: string; onBook: () => void }) {
  switch (tab) {
    case "fares":
      return <FaresRight />;
    case "why":
      return <WhyRight />;
    case "contact":
      return <ContactRight onBook={onBook} />;
    case "rides":
    default:
      return <RidesRight onBook={onBook} />;
  }
}

function RidesLeft() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Our Rides</h2>
      <div className="rounded-2xl border border-yellow-400/40 bg-yellow-50 p-5 dark:bg-yellow-900/20">
        <TukTukIcon className="mx-auto h-28 w-28" />
        <h3 className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">Tuk-tuk</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Fast, fun and budget-friendly. Zip through campus traffic and short town runs without breaking the bank.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
          <li className="flex items-center gap-2"><Bike className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /> Up to 3 passengers</li>
          <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /> Available 24/7</li>
          <li className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /> Student discounts</li>
        </ul>
      </div>
    </div>
  );
}

function RidesRight({ onBook }: { onBook: () => void }) {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">&nbsp;</h2>
      <div className="rounded-2xl border border-yellow-400/40 bg-yellow-50 p-5 dark:bg-yellow-900/20">
        <TaxiIcon className="mx-auto h-28 w-28" />
        <h3 className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">Private Taxi</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Comfortable, safe and private. Ideal for groups, luggage or late-night trips around Mombasa.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
          <li className="flex items-center gap-2"><Users className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /> Up to 4 passengers</li>
          <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /> Vetted drivers</li>
          <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /> On-time pickups</li>
        </ul>
        <button
          onClick={onBook}
          className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-yellow-400 transition hover:bg-slate-800"
        >
          Book a ride
        </button>
      </div>
    </div>
  );
}

function FaresLeft() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Student Fares</h2>
      <p className="mb-4 text-sm text-slate-700 dark:text-slate-300">Prices shown are estimates for campus and nearby routes. Final fare depends on distance and time.</p>
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-600">
        <table className="w-full text-left text-sm">
          <thead className="bg-yellow-400 text-slate-900">
            <tr>
              <th className="px-4 py-2">Route type</th>
              <th className="px-4 py-2">Tuk-tuk</th>
              <th className="px-4 py-2">Taxi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
            <tr className="bg-white dark:bg-slate-800"><td className="px-4 py-2">Within campus</td><td className="px-4 py-2">KES 30 – 60</td><td className="px-4 py-2">KES 80 – 120</td></tr>
            <tr className="bg-white dark:bg-slate-800"><td className="px-4 py-2">Campus to town</td><td className="px-4 py-2">KES 80 – 150</td><td className="px-4 py-2">KES 250 – 400</td></tr>
            <tr className="bg-white dark:bg-slate-800"><td className="px-4 py-2">Night ride</td><td className="px-4 py-2">KES 60 – 100</td><td className="px-4 py-2">KES 200 – 350</td></tr>
            <tr className="bg-white dark:bg-slate-800"><td className="px-4 py-2">Group of 3+</td><td className="px-4 py-2">KES 50 each</td><td className="px-4 py-2">Split fare</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FaresRight() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Ways to pay</h2>
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <CreditCard className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Cash or M-Pesa</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">Pay the driver directly after your ride. No hidden app charges.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Student discount</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">Show your student ID and save on every ride, every day.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Share a ride</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">Pool with classmates heading the same way and split the cost.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhyLeft() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Why Jayjay?</h2>
      <div className="space-y-4">
        <div className="rounded-xl border-l-4 border-yellow-400 bg-slate-50 p-4 dark:bg-slate-700/40">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Built for students</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300">We keep fares low because we know student life.</p>
        </div>
        <div className="rounded-xl border-l-4 border-yellow-400 bg-slate-50 p-4 dark:bg-slate-700/40">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Safe & reliable</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300">Every driver is verified and rides are tracked.</p>
        </div>
        <div className="rounded-xl border-l-4 border-yellow-400 bg-slate-50 p-4 dark:bg-slate-700/40">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">On campus</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300">Find us at the Technical University of Mombasa Transit Desk.</p>
        </div>
      </div>
    </div>
  );
}

function WhyRight() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Loved by riders</h2>
      <div className="space-y-4">
        <div className="rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="flex gap-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
          </div>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">“Cheapest way to get to class on time. The tuk-tuks are always outside the hostel.”</p>
          <p className="mt-2 text-xs font-bold text-slate-900 dark:text-slate-100">— Mercy, Engineering</p>
        </div>
        <div className="rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="flex gap-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
          </div>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">“I use the taxi when coming back late from town. Drivers are friendly and safe.”</p>
          <p className="mt-2 text-xs font-bold text-slate-900 dark:text-slate-100">— Brian, Business</p>
        </div>
      </div>
    </div>
  );
}

function ContactLeft() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Contact us</h2>
      <p className="mb-6 text-sm text-slate-700 dark:text-slate-300">Need a ride, have a question or want to partner with us? Reach out anytime.</p>
      <div className="space-y-4">
        <a href="tel:+254712345678" className="flex items-center gap-3 rounded-xl bg-yellow-50 p-4 transition hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30">
          <Phone className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">+254 712 345 678</span>
        </a>
        <a href="mailto:bookings@jayjayrides.co.ke" className="flex items-center gap-3 rounded-xl bg-yellow-50 p-4 transition hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30">
          <Mail className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">bookings@jayjayrides.co.ke</span>
        </a>
        <div className="flex items-start gap-3 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <MapPin className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Technical University of Mombasa</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Transit Desk, Mombasa, Kenya</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRight({ onBook }: { onBook: () => void }) {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Ready to roll?</h2>
      <p className="mb-4 text-sm text-slate-700 dark:text-slate-300">Tap the button below to open the booking form. Choose tuk-tuk or taxi, tell us where to pick you up and we will handle the rest.</p>
      <div className="rounded-2xl border border-yellow-400/40 bg-yellow-50 p-6 text-center dark:bg-yellow-900/20">
        <TaxiIcon className="mx-auto h-24 w-24" />
        <button
          onClick={onBook}
          className="mt-5 w-full rounded-xl bg-slate-900 py-3 text-base font-bold text-yellow-400 shadow-lg transition hover:bg-slate-800"
        >
          Book a ride now
        </button>
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">Average response time: under 5 minutes</p>
      </div>
    </div>
  );
}
