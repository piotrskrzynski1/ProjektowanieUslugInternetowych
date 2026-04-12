import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../ui";

type Mode = "login" | "register";

const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login({ username, password });
      } else {
        await register({ username, email, password });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Błąd logowania";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "24px", fontSize: "22px" }}>
          🪙 CryptoTracker
        </h2>

        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: "6px", padding: "24px" }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", marginBottom: "20px", borderBottom: "2px solid #eee" }}>
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "none",
                  background: "none",
                  fontSize: "14px",
                  fontWeight: mode === m ? 600 : 400,
                  color: mode === m ? "#0066cc" : "#888",
                  borderBottom: mode === m ? "2px solid #0066cc" : "2px solid transparent",
                  marginBottom: "-2px",
                  cursor: "pointer",
                }}
              >
                {m === "login" ? "Logowanie" : "Rejestracja"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <Input label="Nazwa użytkownika" placeholder="username" value={username}
              onChange={(e) => setUsername(e.target.value)} required fullWidth />

            {mode === "register" && (
              <Input label="Email" type="email" placeholder="email@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required fullWidth />
            )}

            <Input label="Hasło" type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} required fullWidth />

            {error && (
              <div style={{ padding: "8px 12px", background: "#f8d7da", border: "1px solid #f5c6cb",
                borderRadius: "4px", fontSize: "13px", color: "#721c24" }}>
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", marginTop: "4px" }}>
              {mode === "login" ? "Zaloguj się" : "Zarejestruj się"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
