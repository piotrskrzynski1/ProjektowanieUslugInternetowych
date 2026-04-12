import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  WatchlistResponse,
  WatchlistCoin,
  CreateWatchlistEntryRequest,
  UpdateWatchlistEntryRequest,
  AvailableCoinsResponse,
} from "../types";

// ─── Base config ────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Token helpers ───────────────────────────────
const TOKEN_KEY = "ct_tokens";

export const saveTokens = (tokens: AuthTokens) =>
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));

export const loadTokens = (): AuthTokens | null => {
  const raw = localStorage.getItem(TOKEN_KEY);
  return raw ? (JSON.parse(raw) as AuthTokens) : null;
};

export const clearTokens = () => localStorage.removeItem(TOKEN_KEY);

// ─── Request interceptor: attach access token ────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokens = loadTokens();
  if (tokens?.access && config.headers) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

// ─── Response interceptor: auto-refresh on 401 ──
let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !original._retry) {
      const tokens = loadTokens();
      if (!tokens?.refresh) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ access: string }>(
          `${BASE_URL}/auth/token/refresh/`,
          { refresh: tokens.refresh }
        );
        const newTokens: AuthTokens = { ...tokens, access: data.access };
        saveTokens(newTokens);
        queue.forEach((cb) => cb(data.access));
        queue = [];
        original.headers.Authorization = `Bearer ${data.access}`;
        return apiClient(original);
      } catch {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────
// Auth endpoints
// ─────────────────────────────────────────────────
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>("/auth/login/", data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>("/auth/register/", data).then((r) => r.data),

  logout: (refresh: string) =>
    apiClient.post("/auth/logout/", { refresh }),
};

// ─────────────────────────────────────────────────
// Watchlist CRUD  — maps 1:1 to Django ViewSet
// ─────────────────────────────────────────────────
export const watchlistApi = {
  // GET /watchlist/  → list user's coins with live market data
  getAll: () =>
    apiClient.get<WatchlistResponse>("/watchlist/").then((r) => r.data),

  // POST /watchlist/
  add: (body: CreateWatchlistEntryRequest) =>
    apiClient.post<WatchlistCoin>("/watchlist/", body).then((r) => r.data),

  // PATCH /watchlist/:id/
  update: (id: string, body: UpdateWatchlistEntryRequest) =>
    apiClient.patch<WatchlistCoin>(`/watchlist/${id}/`, body).then((r) => r.data),

  // DELETE /watchlist/:id/
  remove: (id: string) => apiClient.delete(`/watchlist/${id}/`),
};

// ─────────────────────────────────────────────────
// Coins  (browse / search available coins)
// ─────────────────────────────────────────────────
export const coinsApi = {
  // GET /coins/?search=bit  → proxied CoinGecko list
  search: (query: string) =>
    apiClient
      .get<AvailableCoinsResponse>("/coins/", { params: { search: query } })
      .then((r) => r.data),
};
