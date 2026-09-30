export const MESSAGE_TYPE_META = {
  prospect: { label: "Prospects", singular: "Prospect", icon: "👤", color: "#2563eb", tone: "#eff6ff" },
  topic: { label: "Topics", singular: "Topic", icon: "💡", color: "#7c3aed", tone: "#f5f3ff" },
  research: { label: "Research", singular: "Research", icon: "🔎", color: "#0d9488", tone: "#f0fdfa" },
  activity: { label: "Activity", singular: "Activity", icon: "📈", color: "#64748b", tone: "#f8fafc" },
};

export function formatRelativeTime(timestamp) {
  if (!timestamp) return "";
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

