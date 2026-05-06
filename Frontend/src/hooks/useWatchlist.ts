import { useCallback, useEffect, useState } from "react";
import { watchlistApi, coinsApi } from "../api/client";
import type {
  AvailableCoin,
  CreateWatchlistEntryRequest,
  UpdateWatchlistEntryRequest,
  WatchlistCoin,
} from "../types";

// ─────────────────────────────────────────────────
// useWatchlist  — fetches & manages user's watchlist
// ─────────────────────────────────────────────────
export const useWatchlist = () => {
  const [coins, setCoins] = useState<WatchlistCoin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await watchlistApi.getAll();
      setCoins(data.watchlist);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Failed to load watchlist"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addCoin = useCallback(
    async (body: CreateWatchlistEntryRequest) => {
      const newEntry = await watchlistApi.add(body);
      setCoins((prev) => [...prev, newEntry]);
      return newEntry;
    },
    []
  );

  const updateCoin = useCallback(
    async (id: string, body: UpdateWatchlistEntryRequest) => {
      const updated = await watchlistApi.update(id, body);
      setCoins((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    },
    []
  );

  const removeCoin = useCallback(async (id: string) => {
    await watchlistApi.remove(id);
    setCoins((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { coins, isLoading, error, refetch: fetch, addCoin, updateCoin, removeCoin };
};

// ─────────────────────────────────────────────────
// useCoinSearch  — search available coins to add
// ─────────────────────────────────────────────────
export const useCoinSearch = () => {
  const [results, setResults] = useState<AvailableCoin[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const data = await coinsApi.search(query);
      setResults(data.coins);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clear = useCallback(() => setResults([]), []);

  return { results, isSearching, search, clear };
};
