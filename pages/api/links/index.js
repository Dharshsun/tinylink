'use client';
import { useState, useEffect } from "react";

export default function Home() {
  const [links, setLinks] = useState([]);
  const [originalUrl, setOriginalUrl] = useState("");

  // Fetch all links
  const fetchLinks = async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Create short link
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalUrl }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    setOriginalUrl("");
    fetchLinks();
  };

  // Delete link
  const handleDelete = async (id) => {
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    fetchLinks();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>URL Shortener</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          style={{ padding: "8px", width: "300px" }}
        />
        <button style={{ padding: "8px 16px", marginLeft: "10px" }}>
          Shorten
        </button>
      </form>

      <h2>Your Links</h2>
      {links.length === 0 && <p>No links yet.</p>}

      <ul>
        {links.map((link) => (
          <li key={link._id} style={{ marginBottom: "10px" }}>
            <b>Short:</b>{" "}
            <a href={`/${link.shortCode}`} target="_blank">
              {`${typeof window !== "undefined" ? window.location.origin : ""}/${link.shortCode}`}
            </a>
            <br />
            <b>Original:</b> {link.originalUrl}
            <br />
            <button
              onClick={() => handleDelete(link._id)}
              style={{
                marginTop: "4px",
                padding: "6px 10px",
                background: "red",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}


