"use client";

export default function BusinessPlanning({ documents, onOpen, onCreate, creating, error }) {
  return (
    <section style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "32px 24px" }} aria-labelledby="planning-heading">
      <p style={{ fontSize: 11, color: "#72854f", letterSpacing: 1.2 }}>YOUR BUSINESS COFOUNDER</p>
      <h1 id="planning-heading" style={{ fontSize: 28, margin: "10px 0" }}>Business planning</h1>
      <p style={{ color: "#69715f", fontSize: 14, marginBottom: 24 }}>Open a business model to plan, research, and decide what to build next.</p>
      <button type="button" disabled={creating} onClick={() => onCreate("Untitled")} style={{ background: "#272e22", color: "#f2f8e6", border: 0, borderRadius: 7, padding: "12px 18px", cursor: "pointer", font: "inherit" }}>{creating ? "Creating…" : "+ New business model"}</button>
      {error && <p role="alert" style={{ color: "#b91c1c", marginTop: 16 }}>{error}</p>}
      {documents.length === 0 ? <p style={{ marginTop: 28, color: "#69715f" }}>No business models yet. Create your first one to start planning.</p> : (
        <div style={{ display: "grid", gap: 12, marginTop: 28 }}>
          {documents.map(document => <button type="button" key={document.id} onClick={() => onOpen(document.id)} aria-label={`Open business model: ${document.title || "Untitled"}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, textAlign: "left", border: "1px solid #dde1d2", borderRadius: 9, background: "#f7f7f0", color: "#272e22", padding: "20px", cursor: "pointer", font: "inherit", overflowWrap: "anywhere" }}><span><strong>{document.title || "Untitled"}</strong><small style={{ display: "block", marginTop: 5, color: "#69715f" }}>Open business model canvas</small></span><span aria-hidden="true">↗</span></button>)}
        </div>
      )}
    </section>
  );
}
