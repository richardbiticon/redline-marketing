import { getTakenSlots } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const date = String(req.query.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "date query param required (YYYY-MM-DD)" });
  }

  try {
    const taken = await getTakenSlots(date);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ date, taken });
  } catch (err) {
    console.error("[availability] error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
