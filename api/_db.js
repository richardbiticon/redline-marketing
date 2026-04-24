import { sql } from "@vercel/postgres";

// Whether a Postgres connection is available. Vercel sets POSTGRES_URL
// automatically when you link a Postgres DB via the dashboard. When missing,
// we fall back to in-memory storage so local dev without a DB still works.
export const hasDb = !!process.env.POSTGRES_URL;

// In-memory fallback store (per-process, resets on restart). Only used in
// dev or when the DB isn't configured yet.
const memStore = globalThis.__redlineBookings || (globalThis.__redlineBookings = []);

let schemaReady = false;
async function ensureSchema() {
  if (!hasDb || schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      service TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      timezone TEXT,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      website TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (date, time)
    )
  `;
  schemaReady = true;
}

export async function insertBooking(b) {
  if (hasDb) {
    await ensureSchema();
    await sql`
      INSERT INTO bookings
        (id, service, date, time, timezone, name, company, email, phone, website, notes)
      VALUES
        (${b.id}, ${b.service}, ${b.date}, ${b.time}, ${b.timezone},
         ${b.name}, ${b.company}, ${b.email}, ${b.phone}, ${b.website}, ${b.notes})
    `;
    return;
  }
  memStore.push({ ...b, created_at: new Date().toISOString() });
}

export async function getTakenSlots(date) {
  if (hasDb) {
    await ensureSchema();
    const { rows } = await sql`SELECT time FROM bookings WHERE date = ${date}`;
    return rows.map((r) => r.time);
  }
  return memStore.filter((b) => b.date === date).map((b) => b.time);
}

export async function isSlotTaken(date, time) {
  if (hasDb) {
    await ensureSchema();
    const { rows } = await sql`SELECT 1 FROM bookings WHERE date = ${date} AND time = ${time} LIMIT 1`;
    return rows.length > 0;
  }
  return memStore.some((b) => b.date === date && b.time === time);
}
