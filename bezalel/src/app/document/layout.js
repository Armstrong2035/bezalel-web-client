/**
 * Shared layout for all /document/* routes.
 * Provides the full-height flex container that the sidebar + main area sit inside.
 * The sidebar itself is rendered per-page (needs docId/title), so this layout
 * is intentionally minimal — just the outer shell.
 */
export default function DocumentLayout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        fontFamily:
          "'Poppins', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {children}
    </div>
  );
}
