import React, { useState } from "react";
import type { WatchlistCoin } from "../../types";
import { formatDate, formatMarketCap, formatPercent, formatPrice } from "../../utils/format";
import { Badge, Button, Spinner } from "../ui";

interface Props {
  entry: WatchlistCoin;
  onUpdate: (id: string, notes: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

const CoinRow: React.FC<Props> = ({ entry, onUpdate, onRemove }) => {
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(entry.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const m = entry.market;
  const pct = m?.price_change_percentage_24h ?? 0;

  const handleSaveNote = async () => {
    setSaving(true);
    try { await onUpdate(entry.id, noteValue); setEditingNote(false); }
    finally { setSaving(false); }
  };

  const handleRemove = async () => {
    if (!confirm(`Usunąć ${m?.name ?? entry.coin_id} z listy?`)) return;
    setRemoving(true);
    try { await onRemove(entry.id); }
    finally { setRemoving(false); }
  };

  return (
    <tr style={{ borderBottom: "1px solid #eee" }}>
      <td style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {m ? <img src={m.image} alt={m.name} width={24} height={24} style={{ borderRadius: "50%" }} /> 
             : <div style={{ width: 24, height: 24, background: "#eee", borderRadius: "50%" }} />}
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px" }}>{m?.name ?? entry.coin_id}</div>
            <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}>{m?.symbol}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>
        {m ? formatPrice(m.current_price) : <Spinner size={14} />}
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        {m ? <Badge positive={pct >= 0}>{formatPercent(pct)}</Badge> : "—"}
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right", fontSize: "13px", color: "#555" }}>
        {m ? formatMarketCap(m.market_cap) : "—"}
      </td>
      <td style={{ padding: "10px 12px", fontSize: "12px", color: "#888" }}>
        {entry.notes
          ? <span title={entry.notes}>{entry.notes.slice(0, 30)}{entry.notes.length > 30 ? "…" : ""}</span>
          : <span style={{ color: "#ccc" }}>brak notatki</span>}
      </td>
      <td style={{ padding: "10px 12px", fontSize: "12px", color: "#888", whiteSpace: "nowrap" }}>
        {formatDate(entry.added_at)}
      </td>
      <td style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          <Button size="sm" variant="ghost" onClick={() => setEditingNote((v) => !v)}>Notatka</Button>
          <Button size="sm" variant="danger" loading={removing} onClick={handleRemove}>Usuń</Button>
        </div>
      </td>
      {editingNote && (
        <tr>
          <td colSpan={7} style={{ padding: "8px 12px", background: "#f9f9f9" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <textarea
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                placeholder="Dodaj notatkę..."
                rows={2}
                style={{ flex: 1, resize: "vertical", fontSize: "13px" }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <Button size="sm" loading={saving} onClick={handleSaveNote}>Zapisz</Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingNote(false); setNoteValue(entry.notes ?? ""); }}>Anuluj</Button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </tr>
  );
};

export default CoinRow;
