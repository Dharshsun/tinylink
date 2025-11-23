import pool from "../../../lib/db.cjs";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { rows } = await pool.query(
      `SELECT id, code, target AS originalUrl, total_clicks AS clicks, last_clicked 
       FROM links 
       WHERE deleted = false
       ORDER BY created_at DESC`
    );
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { url, code } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Original URL is required" });
    }

    // Generate random code if not provided
    const shortCode = code?.trim() || Math.random().toString(36).substr(2, 6);

    const result = await pool.query(
      `INSERT INTO links (code, target)
       VALUES ($1, $2)
       RETURNING id, code, target`,
      [shortCode, url]
    );

    return res.status(201).json(result.rows[0]);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
