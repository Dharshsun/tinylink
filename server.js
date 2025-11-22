require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// DB connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Validate URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

// Generate random shortcode
function generateCode() {
  return crypto.randomBytes(4).toString("hex").slice(0, 6);
}

// ----------------------
// HEALTH CHECK
// ----------------------
app.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
});

// ----------------------
// CREATE LINK
// ----------------------
app.post("/api/links", async (req, res) => {
  try {
    let { url, code } = req.body;

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    if (!code) {
      code = generateCode();
    }

    // Check duplicate
    const exists = await pool.query(
      "SELECT * FROM links WHERE code = $1",
      [code]
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({ error: "Code already exists" });
    }

    await pool.query(
      "INSERT INTO links (code, url, clicks, last_clicked) VALUES ($1, $2, 0, null)",
      [code, url]
    );

    res.status(201).json({ code, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------
// LIST ALL LINKS
// ----------------------
app.get("/api/links", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM links ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------
// GET ONE LINK
// ----------------------
app.get("/api/links/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.query("SELECT * FROM links WHERE code = $1", [code]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Code not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------
// DELETE LINK
// ----------------------
app.delete("/api/links/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const result = await pool.query(
      "DELETE FROM links WHERE code = $1 RETURNING *",
      [code]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Code not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------
// REDIRECT HANDLER
// ----------------------
app.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const result = await pool.query("SELECT * FROM links WHERE code = $1", [code]);

    if (result.rowCount === 0) {
      return res.status(404).send("Not found");
    }

    const link = result.rows[0];

    // Update click count
    await pool.query(
      "UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code = $1",
      [code]
    );

    res.redirect(302, link.url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
