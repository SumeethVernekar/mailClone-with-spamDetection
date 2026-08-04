import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../entities/user/api";
import { setToken, ApiError } from "../../shared/api/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      setToken(res.access_token);
      navigate("/inbox");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 15px",
    marginBottom: 12,
    border: "1px solid var(--border)",
    borderRadius: 4,
    fontSize: 15,
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "48px 40px",
          width: 400,
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 8 }}>📧</div>
        <h2 style={{ fontWeight: 400, fontSize: 24, marginBottom: 8 }}>Sign in</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 24 }}>to continue to Mail</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          {error && <p style={{ color: "var(--red)", fontSize: 13 }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
            <Link to="/signup" style={{ fontSize: 14, fontWeight: 500 }}>Create account</Link>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "var(--blue)",
                color: "white",
                border: "none",
                borderRadius: 4,
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}