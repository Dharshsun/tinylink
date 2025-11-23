import pool from "../../../lib/db.cjs";

export default async function handler(req, res) {
  // GET request: fetch all links
  if (req.method === "GET") {
    try {
      const { rows } = await pool.query(
        `SELECT id, code, url AS originalUrl, clicks, last_clicked
         FROM links
         ORDER BY created_at DESC`
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Database query failed" });
    }
  }

  // POST request: create a new short link
  if (req.method === "POST") {
    const { url, code } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Original URL is required" });
    }

    // Generate a random code if not provided
    const shortCode = code?.trim() || Math.random().toString(36).substr(2, 6);

    try {
      const result = await pool.query(
        `INSERT INTO links (code, url)
         VALUES ($1, $2)
         RETURNING id, code, url`,
        [shortCode, url]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Database insert failed" });
    }
  }

  // DELETE request: hard delete a link
  if (req.method === "DELETE") {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID is required to delete a link" });
    }

    try {
      await pool.query(`DELETE FROM links WHERE id = $1`, [id]);
      return res.status(200).json({ message: "Link deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Database delete failed" });
    }
  }

  // If request method is not GET, POST, or DELETE
  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
