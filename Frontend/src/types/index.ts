// ─────────────────────────────────────────────
// Auth / User  (mirrors Django AbstractUser)
// ─────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
}

export interface AuthTokens {
  access: string;   // JWT access token
  refresh: string;  // JWT refresh token
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ─────────────────────────────────────────────
// Watchlist entry  (mirrors crypto_watchlist table)
// ─────────────────────────────────────────────
export interface WatchlistEntry {
  id: string;           // UUID PK
  user_id: number;
  coin_id: string;      // CoinGecko ID, e.g. "bitcoin"
  added_at: string;     // ISO 8601 datetime
  notes: string | null;
}

export interface CreateWatchlistEntryRequest {
  coin_id: string;
  notes?: string;
}

export interface UpdateWatchlistEntryRequest {
  notes: string;
}

// ─────────────────────────────────────────────
// CoinGecko data  (returned by backend after
// fetching from CoinGecko and merging with DB)
// ─────────────────────────────────────────────
export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
}

// Merged: watchlist entry + live market data
export interface WatchlistCoin extends WatchlistEntry {
  market: CoinMarketData | null;
}

// Backend GET /watchlist/ returns this shape
export interface WatchlistResponse {
  watchlist: WatchlistCoin[];
}

// Backend GET /coins/ returns available coins to add
export interface AvailableCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
}

export interface AvailableCoinsResponse {
  coins: AvailableCoin[];
}

// ─────────────────────────────────────────────
// Generic API wrapper
// ─────────────────────────────────────────────
export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}
