import React, { useEffect, useState } from "react";

type Link = {
  id: number;
  code: string;
  url: string;
  clicks: number;
  lastClicked?: string;
  createdAt: string;
};

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function isValidUrl(u: string) {
    try {
      const p = new URL(u);
      return p.protocol === "http:" || p.protocol === "https:";
    } catch { return false; }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidUrl(url)) { setError("Enter a valid URL (include http/https)"); return; }
    if (code && !/^[A-Za-z0-9]{6,8}$/.test(code)) {
      setError("Custom code must be 6-8 alphanumeric characters.");
      return;
    }

    setCreating(true);
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, code: code || undefined }),
    });

    if (res.status === 201) {
      setUrl(""); setCode("");
      await load();
    } else {
      const body = await res.json().catch(()=>({}));
      setError(body?.error || `Error: ${res.status}`);
    }
    setCreating(false);
  }

  async function handleDelete(codeToDelete: string) {
    if (!confirm("Delete link?")) return;
    const res = await fetch(`/api/links/${codeToDelete}`, { method: "DELETE" });
    if (res.status === 204) {
      setLinks((s)=>s.filter(l=>l.code !== codeToDelete));
    } else {
      alert("Delete failed.");
    }
  }

  return (
    <div className="container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>TinyLink</h1>
        <a href="/healthz">Health</a>
      </header>

      <section style={{ marginTop: 16 }} className="card">
        <form onSubmit={handleCreate}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/..." style={{flex:1, padding:8}} />
            <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Optional code (6-8 alnum)" style={{width:220, padding:8}} />
            <button type="submit" disabled={creating} style={{ padding: "8px 12px" }}>{creating ? "Creating..." : "Create"}</button>
          </div>
          {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Links</h2>
        {loading ? <p>Loading...</p> : (
          <table className="card">
            <thead>
              <tr>
                <th>Short</th>
                <th>Target</th>
                <th>Clicks</th>
                <th>Last clicked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map(l => (
                <tr key={l.code}>
                  <td>
                    <a href={`/${l.code}`} target="_blank" rel="noreferrer">{l.code}</a>
                  </td>
                  <td style={{ maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <a href={l.url} target="_blank" rel="noreferrer">{l.url}</a>
                  </td>
                  <td>{l.clicks}</td>
                  <td>{l.lastClicked ? new Date(l.lastClicked).toLocaleString() : "-"}</td>
                  <td>
                    <button onClick={()=>window.location.href=`/code/${l.code}`}>Stats</button>
                    <button onClick={()=>handleDelete(l.code)} style={{ marginLeft: 8 }}>Delete</button>
                    <button onClick={async ()=>{ await navigator.clipboard.writeText(`${location.origin}/${l.code}`); alert("Copied!");}} style={{ marginLeft: 8 }}>Copy</button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && <tr><td colSpan={5}>No links yet.</td></tr>}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
