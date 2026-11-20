import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { GET } from "./route";

vi.mock("@/db", () => ({
  db: {
    execute: vi.fn(),
  },
}));

describe("health route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok true when the database is reachable", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({} as never);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("returns ok false and a 500 when the database is unreachable", async () => {
    vi.mocked(db.execute).mockRejectedValueOnce(new Error("DB down"));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ ok: false });
  });
});
