import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");

  // Fetch all links
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

  // Create new short URL
  const createShortUrl = async () => {
    if (!url.trim()) {
      alert("Please enter a URL");
      return;
    }

    try {
      await axios.post("/api/links", {
        url,
        code: customCode
      });
      setUrl("");
      setCustomCode("");
      fetchLinks();
    } catch (err) {
      console.error("Error creating short URL:", err);
      alert("Failed to create link");
    }
  };

  // Delete link
  const deleteLink = async (id) => {
    try {
      await axios.delete(`/api/links/${id}`);
      fetchLinks();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      <h1>URL Shortener</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ padding: "8px", width: "300px" }}
        />
        <input
          placeholder="Custom Code (optional)"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          style={{ padding: "8px", marginLeft: "10px", width: "160px" }}
        />
        <button
          onClick={createShortUrl}
          style={{
            padding: "9px 14px",
            marginLeft: "10px",
            cursor: "pointer"
          }}
        >
          Create
        </button>
      </div>

      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Short URL</th>
            <th>Original URL</th>
            <th>Clicks</th>
            <th>Last Clicked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id}>
              <td>
                <a
                  href={`/${link.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.code}
                </a>
              </td>
              <td>{link.originalurl || link.target}</td>
              <td>{link.clicks || link.total_clicks}</td>
              <td>
                {link.last_clicked
                  ? new Date(link.last_clicked).toLocaleString()
                  : "Never"}
              </td>
              <td>
                <button
                  onClick={() => deleteLink(link.id)}
                  style={{ cursor: "pointer" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {links.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No links created yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
