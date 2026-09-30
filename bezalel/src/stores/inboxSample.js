/**
 * Sample activity messages for the email-style orchestrator.
 *
 * This module exists so the shell can be built and reviewed before real tool
 * messages are wired in. `buildSampleMessages` maps the templates onto the
 * user's actual documents, so each message points back to a workspace.
 *
 * A real integration later replaces `seedSampleMessages` with a fetch from a
 * durable activity/inbox collection, keeping the same message shape below.
 */

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

export function buildSampleMessages(documents = []) {
  const now = Date.now();
  const minutesAgo = (m) => now - m * 60 * 1000;

  const attach = (index) => {
    const doc = documents.length ? documents[index % documents.length] : null;
    return doc
      ? { documentId: doc.id, documentTitle: doc.title || "Untitled" }
      : { documentId: null, documentTitle: null };
  };

  return [
    {
      id: "sample-prospects",
      type: "prospect",
      source: "Explorium",
      category: "Prospects",
      status: "unread",
      requiresAction: true,
      createdAt: minutesAgo(18),
      ...attach(0),
      subject: "5 new prospects match your customer profile",
      preview: "Explorium found five contacts that match your targeting criteria.",
      body: "Explorium discovered five new contacts that match this workspace's targeting criteria. Each profile includes identity, public evidence, and an ICP match score. I kept the scores visible because you remain the final judge.",
      evidence: [
        { source: "Explorium", title: "Contact discovery", excerpt: "Five profiles delivered from the configured targeting criteria." },
        { source: "Bezalel", title: "ICP scoring", excerpt: "Each profile carries a match score and a short rationale for the fit." },
      ],
      suggestedAngle: "Review the profiles and mark the ones worth a first outreach.",
    },
    {
      id: "sample-icp-review",
      type: "prospect",
      source: "Bezalel",
      category: "Prospects",
      status: "unread",
      requiresAction: true,
      createdAt: minutesAgo(64),
      ...attach(0),
      subject: "ICP score needs your review",
      preview: "One low-scoring prospect may be more valuable than the score suggests.",
      body: "A low-scoring prospect appeared in the last research run. The public signal is weak, but the role and company match your target unusually well. I did not discard the profile. I am asking you to decide.",
      evidence: [
        { source: "Bezalel", title: "ICP assessment", excerpt: "Score below threshold, but role and company match the target closely." },
      ],
      suggestedAngle: "A quick 'research deeper' pass could confirm whether this one is worth keeping.",
    },
    {
      id: "sample-suffering",
      type: "topic",
      source: "Grokbot",
      category: "CHRISTIANITY",
      status: "unread",
      createdAt: minutesAgo(130),
      ...attach(1),
      subject: "Why does God allow suffering?",
      preview: "Search interest around this question is rising across Google, YouTube, and Reddit.",
      body: "The question is emotionally urgent, highly searchable, and gives you room to offer a thoughtful perspective rather than another simple answer.",
      evidence: [
        { source: "Google Search", title: "Growing question demand", excerpt: "Searches for the question and adjacent grief queries have increased." },
        { source: "Reddit", title: "Recurring pastoral question", excerpt: "Multiple high-engagement threads ask for an answer that does not feel dismissive." },
        { source: "YouTube", title: "Long-form interest", excerpt: "Viewers engage most with answers that make room for ambiguity." },
      ],
      suggestedAngle: "Perhaps the more interesting question is not why suffering exists, but what kind of person suffering can make us.",
    },
    {
      id: "sample-agents",
      type: "topic",
      source: "Grokbot",
      category: "AI",
      status: "unread",
      createdAt: minutesAgo(43),
      ...attach(0),
      subject: "Are agents replacing SaaS?",
      preview: "Conversation volume around this argument has increased across AI founder communities.",
      body: "The claim is gaining attention, but the strongest angle is likely a useful distinction rather than a hot take.",
      evidence: [
        { source: "X", title: "Founder discussion", excerpt: "Operators are debating whether agent workflows replace point solutions." },
        { source: "Hacker News", title: "Practical skepticism", excerpt: "The highest-quality responses focus on accountability, data, and workflow ownership." },
      ],
      suggestedAngle: "Agents may change software interfaces, but they do not erase the systems businesses still need to trust.",
    },
    {
      id: "sample-evidence",
      type: "research",
      source: "OpenAI",
      category: "Research",
      status: "unread",
      createdAt: minutesAgo(210),
      ...attach(1),
      subject: "New evidence for your content angle",
      preview: "Web research returned two sources that support a stronger opening question.",
      body: "The research run for this workspace returned two fresh sources that strengthen the opening question you were considering. The angle now has more evidence behind it.",
      evidence: [
        { source: "Web search", title: "Primary source", excerpt: "A recent study supports the tension you want to open with." },
        { source: "Web search", title: "Counterpoint", excerpt: "A credible counterpoint keeps the argument honest." },
      ],
      suggestedAngle: "Lead with the tension, then name the counterpoint before you offer your take.",
    },
    {
      id: "sample-progress",
      type: "activity",
      source: "Poysis",
      category: "POYSIS",
      status: "read",
      createdAt: minutesAgo(900),
      ...attach(0),
      subject: "You made meaningful progress today.",
      preview: "Your project activity suggests a potentially interesting build-in-public story.",
      body: "You moved from model decisions to a working content workflow. The shift itself is useful to other builders.",
      evidence: [
        { source: "Poysis Workspace", title: "Project activity", excerpt: "Business model, content workflow, and export work were all updated today." },
      ],
      suggestedAngle: "The tool became useful when it stopped generating ideas and started preserving decisions.",
    },
  ];
}
