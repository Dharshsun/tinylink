import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");

  const fetchLinks = async () => {
    try {
      const res = await axios.get("/api/links");
      setLinks(res.data);
    } catch (err) {
      console.error("Error fetching links:", err);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const createShortUrl = async () => {
    if (!url.trim()) {
      alert("Please enter a URL");
      return;
    }
    try {
      await axios.post("/api/links", { url, code: customCode });
      setUrl("");
      setCustomCode("");
      fetchLinks();
    } catch (err) {
      console.error("Error creating short URL:", err);
      alert("Failed to create link");
    }
  };

  const deleteLink = async (id) => {
    try {
      await axios.delete("/api/links", { data: { id } });
      fetchLinks();
    } catch (err) {
      console.error("Error deleting link:", err);
      alert("Failed to delete link");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#2c3e50" }}>URL Shortener</h1>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px", gap: "10px" }}>
        <input
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            outline: "none",
            fontSize: "14px"
          }}
        />
        <input
          placeholder="Custom Code (optional)"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          style={{
            padding: "10px",
            width: "180px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            outline: "none",
            fontSize: "14px"
          }}
        />
        <button
          onClick={createShortUrl}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            transition: "background-color 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2980b9")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3498db")}
        >
          Create
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr style={{ backgroundColor: "#f7f7f7", color: "#2c3e50", textAlign: "left" }}>
            <th style={{ padding: "12px" }}>Short URL</th>
            <th style={{ padding: "12px" }}>Original URL</th>
            <th style={{ padding: "12px" }}>Clicks</th>
            <th style={{ padding: "12px" }}>Last Clicked</th>
            <th style={{ padding: "12px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {links.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#7f8c8d" }}>
                No links created yet.
              </td>
            </tr>
          )}

          {links.map((link) => (
            <tr key={link.id} style={{ borderBottom: "1px solid #ecf0f1" }}>
              <td style={{ padding: "12px" }}>
                <a
                  href={`/${link.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#2980b9", textDecoration: "none", fontWeight: "bold" }}
                >
                  {link.code}
                </a>
              </td>
              <td style={{ padding: "12px", wordBreak: "break-all" }}>{link.originalUrl}</td>
              <td style={{ padding: "12px" }}>{link.clicks}</td>
              <td style={{ padding: "12px" }}>
                {link.last_clicked ? new Date(link.last_clicked).toLocaleString() : "Never"}
              </td>
              <td style={{ padding: "12px" }}>
                <button
                  onClick={() => deleteLink(link.id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#e74c3c",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c0392b")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e74c3c")}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
