"use client";

// This fallback must work even if the root layout or its providers fail.
export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#fff", color: "#1a1a1a", fontFamily: "system-ui, sans-serif" }}>
        <main role="alert" style={{ padding: 40, maxWidth: 640, margin: "0 auto" }}>
          <h1>Bezalel could not load</h1>
          <p>Please try again, or reload the page to reconnect.</p>
          <button onClick={reset} style={{ padding: "10px 16px" }}>Try again</button>
          <button onClick={() => window.location.reload()} style={{ padding: "10px 16px", marginLeft: 12 }}>Reload page</button>
        </main>
      </body>
    </html>
  );
}
