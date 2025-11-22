import { useState, useEffect } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all links
  const fetchLinks = async () => {
    const res = await fetch("/api/link");
    const data = await res.json();
    setLinks(data);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Create new short link
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, code }),
    });

    setLoading(false);

    if (res.ok) {
      setUrl("");
      setCode("");
      fetchLinks();
    } else {
      alert("Something went wrong");
    }
  };

  // Delete link
  const deleteLink = async (id) => {
    await fetch(`/api/link/${id}`, { method: "DELETE" });
    fetchLinks();
  };

  // Copy short link
  const copyLink = async (short) => {
    await navigator.clipboard.writeText(short);
    alert("Copied!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">TinyLink Dashboard</h1>

        {/* Form */}
        <form className="mb-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter long URL"
            className="w-full border p-2 rounded"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Custom code (optional)"
            className="w-full border p-2 rounded"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Creating..." : "Shorten URL"}
          </button>
        </form>

        {/* Links Table */}
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Short Link</th>
              <th className="p-2 border">Clicks</th>
              <th className="p-2 border">Last Clicked</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => {
              const shortUrl = `${window.location.origin}/${link.code}`;
              return (
                <tr key={link.id}>
                  <td className="p-2 border text-blue-600 underline cursor-pointer">
                    <a href={shortUrl} target="_blank">
                      {shortUrl}
                    </a>
                  </td>

                  <td className="p-2 border text-center">{link.clicks}</td>

                  <td className="p-2 border text-center">
                    {link.last_clicked
                      ? new Date(link.last_clicked).toLocaleString()
                      : "—"}
                  </td>

                  <td className="p-2 border text-center space-x-2">
                    <button
                      className="px-2 py-1 bg-green-600 text-white rounded"
                      onClick={() => copyLink(shortUrl)}
                    >
                      Copy
                    </button>

                    <button
                      className="px-2 py-1 bg-red-600 text-white rounded"
                      onClick={() => deleteLink(link.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
