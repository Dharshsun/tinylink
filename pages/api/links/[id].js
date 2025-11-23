import pool from "../../../lib/db.cjs";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    await pool.query("UPDATE links SET deleted=true WHERE id=$1", [id]);
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", "DELETE");
  return res.status(405).json({ error: "method_not_allowed" });
}
