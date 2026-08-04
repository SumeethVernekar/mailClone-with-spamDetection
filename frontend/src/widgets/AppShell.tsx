import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../shared/api/client";
import type { Folder } from "../entities/email/types";

interface Props {
  children: ReactNode;
  folder?: Folder;
  onFolderChange?: (f: Folder) => void;
  onCompose: () => void;
  search?: string;
  onSearchChange?: (v: string) => void;
}

function InboxIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function SentIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function SpamIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ComposeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#001d35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

const FOLDERS: { key: Folder; label: string; Icon: typeof InboxIcon }[] = [
  { key: "inbox", label: "Inbox", Icon: InboxIcon },
  { key: "sent", label: "Sent", Icon: SentIcon },
  { key: "spam", label: "Spam", Icon: SpamIcon },
];

export default function AppShell({ children, folder, onFolderChange, onCompose, search, onSearchChange }: Props) {
  const navigate = useNavigate();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          background: "var(--surface)",
          flexShrink: 0,
          gap: 24,
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 140 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, var(--blue), #4285f4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <span style={{ fontSize: 22, color: "#5f6368", fontWeight: 400, letterSpacing: -0.3 }}>Mail</span>
        </div>

        {onSearchChange && (
          <div style={{ flex: 1, maxWidth: 720 }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search mail"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 46px",
                  borderRadius: 24,
                  border: "1px solid transparent",
                  background: "var(--bg)",
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </div>
          </div>
        )}

        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={() => { clearToken(); navigate("/login"); }}
            style={{
              padding: "9px 18px",
              border: "1px solid var(--border)",
              borderRadius: 20,
              background: "var(--surface)",
              color: "var(--text-secondary)",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Log out
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside
          style={{
            width: 256,
            flexShrink: 0,
            padding: "8px 8px 16px",
            background: "var(--bg)",
            overflowY: "auto",
          }}
        >
          <button
            onClick={onCompose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#c2e7ff",
              color: "#001d35",
              border: "none",
              borderRadius: 16,
              padding: "14px 24px",
              fontSize: 14,
              fontWeight: 500,
              margin: "8px 0 20px 8px",
              boxShadow: "var(--shadow-2)",
            }}
          >
            <ComposeIcon /> Compose
          </button>

          {onFolderChange && (
            <nav>
              {FOLDERS.map(({ key, label, Icon }) => {
                const active = folder === key;
                const color = active ? "var(--blue)" : "#5f6368";
                return (
                  <div
                    key={key}
                    onClick={() => onFolderChange(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "9px 20px",
                      borderRadius: "0 20px 20px 0",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: active ? 700 : 400,
                      background: active ? "var(--blue-light)" : "transparent",
                      color: active ? "var(--blue)" : "var(--text)",
                      marginBottom: 2,
                      marginRight: 12,
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--hover-bg)"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    <Icon color={color} />
                    <span>{label}</span>
                  </div>
                );
              })}
            </nav>
          )}
        </aside>

        <main style={{ flex: 1, overflowY: "auto", background: "var(--surface)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}