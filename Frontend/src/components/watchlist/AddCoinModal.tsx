import React, { useEffect, useRef, useState } from "react";
import { useCoinSearch } from "../../hooks/useWatchlist";
import type { AvailableCoin } from "../../types";
import { Button, Input, Spinner } from "../ui";

interface Props {
  onAdd: (coinId: string) => Promise<void>;
  onClose: () => void;
  alreadyWatched: string[];
}

const AddCoinModal: React.FC<Props> = ({ onAdd, onClose, alreadyWatched }) => {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const { results, isSearching, search, clear } = useCoinSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const handleAdd = async (coin: AvailableCoin) => {
    setAdding(coin.id);
    try { await onAdd(coin.id); onClose(); }
    finally { setAdding(null); }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "16px",
      }}
    >
      <div style={{
        background: "#fff", border: "1px solid #ddd", borderRadius: "6px",
        width: "100%", maxWidth: "460px", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 16px", borderBottom: "1px solid #eee",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontWeight: 600 }}>Dodaj kryptowalutę</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "18px", color: "#888", cursor: "pointer" }}>×</button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 16px" }}>
          <Input ref={inputRef} placeholder="Szukaj: bitcoin, ethereum..."
            value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
        </div>

        {/* Results */}
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {isSearching && (
            <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
              <Spinner />
            </div>
          )}

          {!isSearching && query.length > 0 && results.length === 0 && (
            <p style={{ textAlign: "center", color: "#888", padding: "24px", fontSize: "14px" }}>
              Nie znaleziono wyników dla "{query}"
            </p>
          )}

          {!isSearching && query.length === 0 && (
            <p style={{ textAlign: "center", color: "#aaa", padding: "24px", fontSize: "13px" }}>
              Wpisz nazwę kryptowaluty...
            </p>
          )}

          {results.map((coin) => {
            const watched = alreadyWatched.includes(coin.id);
            return (
              <div key={coin.id} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 16px", borderBottom: "1px solid #f5f5f5",
                opacity: watched ? 0.5 : 1,
              }}>
                <img src={coin.image} alt={coin.name} width={26} height={26} style={{ borderRadius: "50%" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>{coin.name}</div>
                  <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}>{coin.symbol}</div>
                </div>
                {watched
                  ? <span style={{ fontSize: "12px", color: "#aaa" }}>już obserwujesz</span>
                  : <Button size="sm" loading={adding === coin.id} onClick={() => handleAdd(coin)}>+ Dodaj</Button>
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AddCoinModal;
