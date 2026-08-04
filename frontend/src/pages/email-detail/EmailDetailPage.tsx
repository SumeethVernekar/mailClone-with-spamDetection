import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchEmailById } from "../../entities/email/api";
import type { Email } from "../../entities/email/types";
import { clearToken, ApiError } from "../../shared/api/client";
import AppShell from "../../widgets/AppShell";

export default function EmailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchEmailById(Number(id))
      .then(setEmail)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          navigate("/login");
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load email");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  return (
    <AppShell onCompose={() => navigate("/inbox")}>
      {loading && <p style={{ padding: 24, color: "var(--text-secondary)" }}>Loading...</p>}
      {error && <p style={{ padding: 24, color: "var(--red)" }}>{error}</p>}
      {email && (
        <div style={{ padding: "24px 40px", maxWidth: 760 }}>
          <button
            onClick={() => navigate("/inbox")}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: 14,
              marginBottom: 16,
              padding: 0,
            }}
          >
            ← Back to inbox
          </button>
          <h2 style={{ fontSize: 22, fontWeight: 400, marginBottom: 16 }}>{email.subject}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--blue)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {email.sender_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{email.sender_name}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {new Date(email.created_at).toLocaleString()}
              </div>
            </div>
          </div>
          <p style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>{email.body}</p>
        </div>
      )}
    </AppShell>
  );
}