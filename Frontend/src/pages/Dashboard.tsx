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
            <Button variant="ghost" size="sm" onClick={refetch}>↺ Odśwież</Button>
            <Button onClick={() => setShowModal(true)}>+ Dodaj coin</Button>
          </div>
        </div>

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
