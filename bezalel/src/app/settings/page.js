"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { useOnboardingStore } from "@/stores/onboardingStore";
import onboardingQuestions from "@/components/onboarding/helpers/onboardingData";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const onboardingData = useOnboardingStore((state) => state.onboardingData);
  const setOnboardingData = useOnboardingStore((state) => state.setOnboardingData);

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/signin");
  }, [user, authLoading, router]);

  const handleChange = (id, value) => {
    setOnboardingData({ [id]: value });
    setSaved(false);
  };

  const handleSave = () => {
    // Data is already persisted in Zustand's localStorage via persist middleware.
    // A real app would also POST to /api/context here.
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (authLoading) {
    return <div style={styles.centered}>Loading…</div>;
  }

  return (
    <div style={styles.page}>
      {/* Back nav */}
      <button
        onClick={() => router.back()}
        style={styles.backBtn}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
      >
        ← Back
      </button>

      <h1 style={styles.pageTitle}>Settings</h1>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["profile", "account"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              borderBottom: activeTab === tab ? "2px solid #1a1a1a" : "2px solid transparent",
              color: activeTab === tab ? "#1a1a1a" : "#999",
              fontWeight: activeTab === tab ? 600 : 400,
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "account" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Account</h2>
          <div style={styles.field}>
            <label style={styles.label}>Display Name</label>
            <p style={styles.staticValue}>{user?.displayName || "—"}</p>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <p style={styles.staticValue}>{user?.email || "—"}</p>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>User ID</label>
            <p style={{ ...styles.staticValue, fontFamily: "monospace", fontSize: 12, color: "#bbb" }}>
              {user?.uid || "—"}
            </p>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Business Profile</h2>
            <p style={styles.sectionSubtitle}>
              This context powers all AI-generated ideas across your documents.
              Keep it accurate for the best results.
            </p>

            {onboardingQuestions.map((q) => (
              <div key={q.id} style={styles.field}>
                <label style={styles.label}>
                  {q.emoji} {q.question}
                </label>
                <p style={styles.fieldHint}>{q.explanation}</p>

                {q.type === "text-input" ? (
                  <textarea
                    value={onboardingData[q.id] || ""}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    rows={4}
                    style={styles.textarea}
                  />
                ) : (
                  <div style={styles.optionGrid}>
                    {q.options.map((opt) => {
                      const isSelected = onboardingData[q.id] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => handleChange(q.id, opt)}
                          style={{
                            ...styles.optionBtn,
                            background: isSelected ? "#1a1a1a" : "white",
                            color: isSelected ? "white" : "#333",
                            borderColor: isSelected ? "#1a1a1a" : "#e0e0de",
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Save bar */}
          <div style={styles.saveBar}>
            <button
              onClick={handleSave}
              style={{
                ...styles.primaryBtn,
                background: saved ? "#4caf50" : "#1a1a1a",
              }}
              onMouseEnter={(e) => {
                if (!saved) e.currentTarget.style.background = "#333";
              }}
              onMouseLeave={(e) => {
                if (!saved) e.currentTarget.style.background = "#1a1a1a";
              }}
            >
              {saved ? "✓ Saved" : "Save Changes"}
            </button>
            <p style={{ margin: 0, fontSize: 12, color: "#bbb" }}>
              Changes are saved to your local profile and used when generating ideas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    padding: "32px 48px 120px",
    maxWidth: 720,
    margin: "0 auto",
    fontFamily:
      "'Poppins', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    color: "#aaa",
    fontSize: 14,
  },
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    color: "#999",
    padding: "0 0 24px",
    display: "block",
    transition: "color 0.15s",
  },
  pageTitle: {
    margin: "0 0 24px",
    fontSize: 28,
    fontWeight: 800,
    color: "#1a1a1a",
    letterSpacing: "-0.5px",
  },
  tabs: {
    display: "flex",
    gap: 0,
    borderBottom: "1px solid #e8e8e6",
    marginBottom: 40,
  },
  tab: {
    padding: "10px 20px",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    fontSize: 14,
    transition: "color 0.15s, border-color 0.15s",
    fontFamily: "inherit",
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    margin: "0 0 6px",
    fontSize: 18,
    fontWeight: 700,
    color: "#1a1a1a",
    letterSpacing: "-0.3px",
  },
  sectionSubtitle: {
    margin: "0 0 28px",
    fontSize: 13,
    color: "#999",
    lineHeight: 1.5,
  },
  field: {
    marginBottom: 28,
  },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  fieldHint: {
    margin: "0 0 10px",
    fontSize: 12,
    color: "#aaa",
    lineHeight: 1.5,
  },
  staticValue: {
    margin: 0,
    fontSize: 14,
    color: "#555",
    padding: "8px 0",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    lineHeight: 1.6,
    border: "1px solid #e0e0de",
    borderRadius: 7,
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
    color: "#1a1a1a",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  optionGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  optionBtn: {
    padding: "7px 14px",
    fontSize: 13,
    border: "1px solid",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
    lineHeight: 1.4,
  },
  saveBar: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "20px 24px",
    background: "#fafafa",
    borderRadius: 10,
    border: "1px solid #e8e8e6",
    flexWrap: "wrap",
  },
  primaryBtn: {
    padding: "9px 20px",
    fontSize: 13,
    fontWeight: 600,
    color: "white",
    background: "#1a1a1a",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    transition: "background 0.15s",
  },
};
