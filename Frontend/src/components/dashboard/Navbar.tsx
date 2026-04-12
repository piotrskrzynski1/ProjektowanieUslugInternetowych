import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <nav style={{
      background: "#fff", borderBottom: "1px solid #ddd",
      padding: "0 24px", height: "52px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <span style={{ fontWeight: 700, fontSize: "16px" }}>🪙 CryptoTracker</span>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "13px", color: "#666" }}>Zalogowany: <strong>{user?.username}</strong></span>
        <Button variant="ghost" size="sm" onClick={logout}>Wyloguj</Button>
      </div>
    </nav>
  );
};

export default Navbar;
