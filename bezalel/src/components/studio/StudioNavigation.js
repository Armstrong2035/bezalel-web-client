"use client";

const navGroups = [
  [{ id: "inbox", label: "Inbox" }, { id: "drafts", label: "Drafts" }, { id: "published", label: "Published" }],
  [{ id: "projects", label: "Projects" }, { id: "automations", label: "Automations" }, { id: "sources", label: "Opportunities" }],
  [{ id: "settings", label: "Settings" }],
];

export function StudioNavigation({ view, setView, onOpen }) {
  const chooseView = (nextView) => {
    onOpen?.();
    setView(nextView);
  };

  return <div style={studioTreeStyles.tree}>
    <button onClick={() => chooseView("inbox")} style={studioTreeStyles.parent}>
      <span style={studioTreeStyles.branch}>⌄</span>
      Validation Studio
    </button>
    <div style={studioTreeStyles.children}>
      {navGroups.flat().map((item) => (
        <button
          key={item.id}
          onClick={() => chooseView(item.id)}
          style={{ ...studioTreeStyles.child, ...(view === item.id ? studioTreeStyles.childActive : {}) }}
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>;
}

const studioTreeStyles = {
  tree: { margin: "8px 0 4px" },
  parent: { display: "flex", alignItems: "center", gap: 7, width: "100%", padding: "7px 8px", border: "none", borderRadius: 4, background: "transparent", color: "#252523", textAlign: "left", font: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  branch: { color: "#8a8a84", fontSize: 14, lineHeight: 1 },
  children: { marginLeft: 14, paddingLeft: 10, borderLeft: "1px solid #dddeda", display: "grid", gap: 1 },
  child: { width: "100%", padding: "6px 8px", border: "none", borderRadius: 4, background: "transparent", color: "#6e6e69", textAlign: "left", font: "inherit", fontSize: 12, cursor: "pointer" },
  childActive: { background: "#e9e9e4", color: "#222", fontWeight: 700 },
};

