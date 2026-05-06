import React from "react";
import type { WatchlistCoin } from "../../types";
import { Button, Spinner } from "../ui";
import CoinRow from "./CoinRow";

interface Props {
  coins: WatchlistCoin[];
  isLoading: boolean;
  error: string | null;
  onAdd: () => void;
  onUpdate: (id: string, notes: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

const WatchlistTable: React.FC<Props> = ({ coins, isLoading, error, onAdd, onUpdate, onRemove }) => {
  const thStyle: React.CSSProperties = {
    padding: "8px 12px", textAlign: "left", fontSize: "12px",
    color: "#666", fontWeight: 600, borderBottom: "2px solid #ddd",
    background: "#f8f8f8",
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: "6px", overflow: "hidden" }}>
      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <Spinner size={28} />
        </div>
      )}

      {error && !isLoading && (
        <div style={{ padding: "20px", color: "#721c24", background: "#f8d7da", fontSize: "14px" }}>
          Błąd: {error}
        </div>
      )}

      {!isLoading && !error && coins.length === 0 && (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "#888", marginBottom: "16px" }}>Twoja lista obserwowanych jest pusta.</p>
          <Button onClick={onAdd}>+ Dodaj pierwszy coin</Button>
        </div>
      )}

      {!isLoading && coins.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Nazwa</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Cena</th>
              <th style={{ ...thStyle, textAlign: "right" }}>24h %</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Market Cap</th>
              <th style={thStyle}>Notatka</th>
              <th style={thStyle}>Dodano</th>
              <th style={thStyle}>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((entry) => (
              <CoinRow key={entry.id} entry={entry} onUpdate={onUpdate} onRemove={onRemove} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WatchlistTable;
