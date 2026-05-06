import React from "react";
import type { WatchlistCoin } from "../../types";
import { formatMarketCap } from "../../utils/format";

interface Props { coins: WatchlistCoin[]; }

const StatsBar: React.FC<Props> = ({ coins }) => {
  const withData = coins.filter((c) => c.market !== null);
  const totalMcap = withData.reduce((sum, c) => sum + (c.market?.market_cap ?? 0), 0);
  const avgChange = withData.length > 0
    ? withData.reduce((sum, c) => sum + (c.market?.price_change_percentage_24h ?? 0), 0) / withData.length
    : 0;

  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
      {[
        { label: "Obserwowane", value: `${coins.length} coinów` },
        { label: "Śr. zmiana 24h", value: `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`, color: avgChange >= 0 ? "#155724" : "#721c24" },
        { label: "Łączna kapitalizacja", value: formatMarketCap(totalMcap) },
      ].map((s) => (
        <div key={s.label} style={{
          background: "#fff", border: "1px solid #ddd", borderRadius: "6px",
          padding: "12px 16px", flex: "1", minWidth: "140px",
        }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>{s.label}</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: s.color ?? "#333" }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
