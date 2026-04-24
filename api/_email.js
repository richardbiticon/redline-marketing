import { Resend } from "resend";

const RESEND_KEY = process.env.RESEND_API_KEY;
// Default to Resend's sandbox sender so we don't need domain verification
// during early testing. Override with BOOKING_FROM once a domain is verified.
const FROM = process.env.BOOKING_FROM || "Red Line Marketing <onboarding@resend.dev>";
const NOTIFY_TO = process.env.BOOKING_NOTIFY || "richard95biticcon@gmail.com";

const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

const fmtDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
};
const fmtTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const customerHtml = (b) => `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0A0A0A;font-family:Helvetica,Arial,sans-serif;color:#fff;">
  <div style="max-width:560px;margin:0 auto;padding:40px 28px;">
    <div style="padding:4px 12px;display:inline-block;background:rgba(212,25,32,0.12);border:1px solid rgba(212,25,32,0.35);border-radius:999px;color:#FF2D35;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;margin-bottom:20px;">Booking Confirmed</div>
    <h1 style="font-size:32px;line-height:1.05;margin:0 0 14px 0;text-transform:uppercase;letter-spacing:-0.5px;">You're on the <span style="color:#D41920;">calendar.</span></h1>
    <p style="color:rgba(255,255,255,0.6);line-height:1.6;font-size:15px;margin:0 0 28px 0;">Thanks, ${b.name}. We've saved your consultation — here are the details.</p>

    <div style="padding:2px;background:linear-gradient(135deg,#D41920 0%,#A8131A 40%,rgba(255,255,255,0.1) 100%);border-radius:14px;">
      <div style="background:#0d0607;padding:26px;border-radius:12px;">
        <div style="border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;margin-bottom:16px;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;font-weight:600;margin-bottom:4px;">Confirmation</div>
          <div style="font-size:22px;font-weight:700;letter-spacing:1.5px;">${b.id}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 12px 6px 0;color:#999;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Date</td><td style="padding:6px 0;color:#fff;">${fmtDate(b.date)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#999;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Time</td><td style="padding:6px 0;color:#fff;">${fmtTime(b.time)} · ${b.timezone || ""}</td></tr>
          ${b.service ? `<tr><td style="padding:6px 12px 6px 0;color:#999;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Focus</td><td style="padding:6px 0;color:#fff;">${b.service}</td></tr>` : ""}
        </table>
      </div>
    </div>

    <p style="color:rgba(255,255,255,0.55);line-height:1.6;font-size:13px;margin:28px 0 0 0;">If anything changes, reply to this email and we'll sort it out.<br/><br/>— Red Line Marketing</p>
  </div>
</body></html>`;

const notifyHtml = (b) => `
<!DOCTYPE html>
<html><body style="font-family:Helvetica,Arial,sans-serif;background:#f5f5f5;padding:20px;color:#111;">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:28px;border-radius:10px;border:1px solid #e5e5e5;">
    <div style="color:#D41920;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:11px;">New Booking</div>
    <h2 style="margin:6px 0 18px 0;font-size:22px;">${b.name} — ${b.service || "Consultation"}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 12px 4px 0;color:#666;">Confirmation</td><td>${b.id}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666;">When</td><td>${fmtDate(b.date)} · ${fmtTime(b.time)} (${b.timezone || ""})</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td>${b.email}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666;">Phone</td><td>${b.phone}</td></tr>
      ${b.company ? `<tr><td style="padding:4px 12px 4px 0;color:#666;">Company</td><td>${b.company}</td></tr>` : ""}
      ${b.website ? `<tr><td style="padding:4px 12px 4px 0;color:#666;">Website</td><td>${b.website}</td></tr>` : ""}
      ${b.notes ? `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top;">Notes</td><td style="white-space:pre-wrap;">${b.notes}</td></tr>` : ""}
    </table>
  </div>
</body></html>`;

function buildIcs(b) {
  const [y, m, d] = b.date.split("-").map(Number);
  const [hh, mm] = b.time.split(":").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const toICS = (dt) => `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Red Line Marketing//Consultation//EN",
    "BEGIN:VEVENT",
    `UID:${b.id}@redlinemarketing`,
    `DTSTAMP:${toICS(new Date())}`,
    `DTSTART:${toICS(start)}`,
    `DTEND:${toICS(end)}`,
    `SUMMARY:Red Line Marketing — ${b.service || "Consultation"}`,
    `DESCRIPTION:AI Marketing Consultation.\\nConfirmation: ${b.id}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export async function sendBookingEmails(booking) {
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set — skipping emails. Booking:", booking.id);
    return { skipped: true };
  }
  const ics = buildIcs(booking);
  const attachment = {
    filename: `redline-consultation-${booking.id}.ics`,
    content: Buffer.from(ics).toString("base64"),
  };
  try {
    const [customer, team] = await Promise.all([
      resend.emails.send({
        from: FROM,
        to: booking.email,
        subject: `You're booked — ${booking.id} · Red Line Marketing`,
        html: customerHtml(booking),
        attachments: [attachment],
      }),
      resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        subject: `🔥 New booking — ${booking.name} (${fmtDate(booking.date)} ${fmtTime(booking.time)})`,
        html: notifyHtml(booking),
        replyTo: booking.email,
      }),
    ]);
    return { customer, team };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { error: String(err?.message || err) };
  }
}
