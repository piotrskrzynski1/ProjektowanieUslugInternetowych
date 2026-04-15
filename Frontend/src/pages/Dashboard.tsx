import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../hooks/useWatchlist";
import { Button } from "../components/ui";
import StatsBar from "../components/dashboard/StatsBar";
import Navbar from "../components/dashboard/Navbar";
import WatchlistTable from "../components/watchlist/WatchlistTable";
import AddCoinModal from "../components/watchlist/AddCoinModal";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { coins, isLoading, error, addCoin, updateCoin, removeCoin, refetch } = useWatchlist();
  const [showModal, setShowModal] = useState(false);
  
  // Состояние для показа JSON (специально для защиты)
  const [showJson, setShowJson] = useState(false);

  const handleAdd = async (coinId: string) => {
    await addCoin({ coin_id: coinId });
  };

  const handleUpdate = async (id: string, notes: string) => {
    await updateCoin(id, { notes });
  };

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Lista obserwowanych</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
              Zalogowany jako: {user?.username} · ceny z CoinGecko
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {/* Кнопка для преподавателя */}
            <Button variant="ghost" size="sm" onClick={() => setShowJson(!showJson)}>
              {showJson ? "✕ Ukryj JSON" : "{ } Pokaż JSON"}
            </Button>
            
            <Button variant="ghost" size="sm" onClick={refetch}>↺ Odśwież</Button>
            <Button onClick={() => setShowModal(true)}>+ Dodaj coin</Button>
          </div>
        </div>

        {/* ПАНЕЛЬ С JSON (выводится только при нажатии на кнопку) */}
        {showJson && (
          <div style={{ 
            background: "#1a1a1a", 
            border: "1px solid #333", 
            borderRadius: "8px", 
            padding: "16px", 
            marginBottom: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)" 
          }}>
            <h3 style={{ color: "#4ade80", fontSize: "14px", marginBottom: "10px", fontFamily: "monospace" }}>
              // Struktura danych REST API (JSON)
            </h3>
            <pre style={{ 
              fontSize: "12px", 
              color: "#ccc", 
              overflowX: "auto", 
              background: "#000", 
              padding: "12px", 
              borderRadius: "4px",
              maxHeight: "300px" 
            }}>
              {JSON.stringify({ watchlist: coins }, null, 2)}
            </pre>
          </div>
        )}

        {coins.length > 0 && <StatsBar coins={coins} />}

        <WatchlistTable
          coins={coins}
          isLoading={isLoading}
          error={error}
          onAdd={() => setShowModal(true)}
          onUpdate={handleUpdate}
          onRemove={removeCoin}
        />
      </main>

      {showModal && (
        <AddCoinModal
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
          alreadyWatched={coins.map((c) => c.coin_id)}
        />
      )}
    </>
  );
};

export default Dashboard;