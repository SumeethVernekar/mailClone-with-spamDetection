import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmails } from "../../entities/email/api";
import type { Email, Folder } from "../../entities/email/types";
import { clearToken, ApiError } from "../../shared/api/client";
import ComposeModal from "../../features/compose-email/ComposeModal";
import AppShell from "../../widgets/AppShell";

const AVATAR_COLORS = ["#1a73e8", "#d93025", "#188038", "#e37400", "#9334e6", "#12b5cb"];
function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function InboxPage() {
  const [folder, setFolder] = useState<Folder>("inbox");
  const [sortPriority, setSortPriority] = useState(false);
  const [search, setSearch] = useState("");
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const navigate = useNavigate();

  function loadEmails() {
    setLoading(true);
    setError(null);
    fetchEmails(folder, sortPriority ? "priority" : undefined, search || undefined)
      .then(setEmails)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          navigate("/login");
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load emails");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = setTimeout(loadEmails, search ? 300 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, sortPriority, search]);

  return (
    <AppShell
      folder={folder}
      onFolderChange={setFolder}
      onCompose={() => setShowCompose(true)}
      search={search}
      onSearchChange={setSearch}
    >
      <div style={{ padding: "16px 24px 12px", display: "flex", alignItems: "center", gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 400, textTransform: "capitalize" }}>{folder}</h2>
        <label style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={sortPriority}
            onChange={(e) => setSortPriority(e.target.checked)}
          />
          Sort by priority
        </label>
      </div>

      {loading && <p style={{ padding: 24, color: "var(--text-secondary)" }}>Loading...</p>}
      {error && <p style={{ padding: 24, color: "var(--red)" }}>{error}</p>}
      {!loading && !error && emails.length === 0 && (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p>No emails in {folder}.</p>
        </div>
      )}

      <ul style={{ listStyle: "none", margin: "0 12px", padding: 0 }}>
        {emails.map((email) => (
          <li
            key={email.id}
            onClick={() => navigate(`/email/${email.id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "10px 12px",
              borderRadius: 8,
              cursor: "pointer",
              background: "var(--surface)",
              fontWeight: email.is_read ? 400 : 700,
              fontSize: 14,
              borderBottom: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-1)";
              e.currentTarget.style.background = "var(--hover-bg)";
              e.currentTarget.style.zIndex = "1";
              e.currentTarget.style.position = "relative";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "var(--surface)";
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: avatarColor(email.sender_name),
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {email.sender_name.charAt(0).toUpperCase()}
            </div>

            {email.priority_score > 0.7 && (
              <span title="High priority" style={{ color: "var(--red)", fontSize: 10, flexShrink: 0 }}>●</span>
            )}

            <span style={{ width: 160, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {email.sender_name}
            </span>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: email.is_read ? "var(--text-secondary)" : "var(--text)" }}>
              {email.subject} <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>— {email.body}</span>
            </span>
            <span style={{ flexShrink: 0, fontSize: 12, color: "var(--text-secondary)", minWidth: 70, textAlign: "right" }}>
              {new Date(email.created_at).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
            </span>
          </li>
        ))}
      </ul>

      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSent={loadEmails}
        />
      )}
    </AppShell>
  );
}