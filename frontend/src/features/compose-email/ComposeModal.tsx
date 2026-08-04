import { useState, FormEvent } from "react";
import { sendEmail } from "../../entities/email/api";
import { ApiError } from "../../shared/api/client";

interface Props {
  onClose: () => void;
  onSent: () => void;
}

export default function ComposeModal({ onClose, onSent }: Props) {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await sendEmail({ recipient_email: recipient, subject, body });
      onSent();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 4px",
    border: "none",
    borderBottom: "1px solid var(--border)",
    marginBottom: 4,
    fontSize: 14,
    outline: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: 24,
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "12px 12px 0 0",
          width: 460,
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "#f2f6fc",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          New Message
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 16, color: "var(--text-secondary)" }}
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "8px 16px 16px" }}>
          <input
            type="email"
            placeholder="To"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            style={inputStyle}
          />
          <textarea
            placeholder="Compose your message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={10}
            style={{ ...inputStyle, border: "none", resize: "vertical", marginTop: 8 }}
          />
          {error && <p style={{ color: "var(--red)", fontSize: 13 }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="submit"
              disabled={sending}
              style={{
                background: "var(--blue)",
                color: "white",
                border: "none",
                borderRadius: 20,
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}