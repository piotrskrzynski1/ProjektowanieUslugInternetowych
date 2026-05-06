import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary", size = "md", loading, children, disabled, style, ...rest
}) => {
  const base: React.CSSProperties = {
    padding: size === "sm" ? "5px 10px" : "8px 16px",
    fontSize: size === "sm" ? "13px" : "14px",
    border: "1px solid",
    borderRadius: "4px",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    opacity: disabled || loading ? 0.6 : 1,
    cursor: disabled || loading ? "not-allowed" : "pointer",
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: "#0066cc", borderColor: "#0056b3", color: "#fff" },
    ghost:   { background: "#fff",    borderColor: "#ccc",    color: "#333" },
    danger:  { background: "#fff",    borderColor: "#cc0000", color: "#cc0000" },
  };
  return (
    <button disabled={disabled || loading} style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {loading ? <Spinner size={13} /> : null}
      {children}
    </button>
  );
};

export const Spinner: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = "#0066cc" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: "6px", padding: "16px", ...style }}>
    {children}
  </div>
);

export const Badge: React.FC<{ positive?: boolean; children: React.ReactNode }> = ({ positive, children }) => (
  <span style={{
    display: "inline-block", padding: "2px 7px", borderRadius: "4px",
    fontSize: "12px", fontWeight: 600,
    background: positive ? "#d4edda" : "#f8d7da",
    color: positive ? "#155724" : "#721c24",
    border: `1px solid ${positive ? "#c3e6cb" : "#f5c6cb"}`,
  }}>
    {children}
  </span>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, fullWidth, style, ...rest }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: fullWidth ? "100%" : undefined }}>
    {label && <label style={{ fontSize: "13px", fontWeight: 500, color: "#555" }}>{label}</label>}
    <input style={{ width: fullWidth ? "100%" : undefined, ...style }} {...rest} />
    {error && <span style={{ fontSize: "12px", color: "#cc0000" }}>{error}</span>}
  </div>
);
