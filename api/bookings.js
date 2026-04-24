import { insertBooking, isSlotTaken } from "./_db.js";
import { rateLimit } from "./_rateLimit.js";
import { sendBookingEmails } from "./_email.js";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

function makeConfirmationId() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `RLM-${out}`;
}

function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function validate(body) {
  const errors = {};
  if (!body || typeof body !== "object") return { errors: { _form: "Invalid payload" } };
  const { service, date, time, timezone, details } = body;
  if (!date || !DATE_RE.test(date)) errors.date = "Invalid date";
  if (!time || !TIME_RE.test(time)) errors.time = "Invalid time";
  if (!details || typeof details !== "object") {
    errors._form = "Missing details";
    return { errors };
  }
  if (!details.name?.trim()) errors.name = "Required";
  if (!details.email?.trim()) errors.email = "Required";
  else if (!EMAIL_RE.test(details.email)) errors.email = "Invalid email";
  if (!details.phone?.trim()) errors.phone = "Required";
  return { errors, clean: { service, date, time, timezone, details } };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = clientIp(req);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const { errors, clean } = validate(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  try {
    if (await isSlotTaken(clean.date, clean.time)) {
      return res.status(409).json({ error: "That slot was just taken. Please pick another time.", code: "slot_taken" });
    }

    const booking = {
      id: makeConfirmationId(),
      service: clean.service || null,
      date: clean.date,
      time: clean.time,
      timezone: clean.timezone || null,
      name: clean.details.name.trim(),
      company: clean.details.company?.trim() || null,
      email: clean.details.email.trim(),
      phone: clean.details.phone.trim(),
      website: clean.details.website?.trim() || null,
      notes: clean.details.notes?.trim() || null,
    };

    await insertBooking(booking);

    // Fire-and-forget emails; don't block the response if they fail
    sendBookingEmails(booking).catch((err) => console.error("[email] background failure:", err));

    return res.status(201).json({ booking });
  } catch (err) {
    // Race condition: unique constraint violation on (date, time)
    if (String(err?.code) === "23505") {
      return res.status(409).json({ error: "That slot was just taken. Please pick another time.", code: "slot_taken" });
    }
    console.error("[bookings] error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
