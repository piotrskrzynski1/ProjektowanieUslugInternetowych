# CryptoTrack — Instrukcja integracji Frontend ↔ Backend

## Spis treści
1. Struktura projektu
2. Uruchomienie frontendu
3. Wymagane endpointy Django
4. Konfiguracja JWT w Django
5. CORS
6. Przepływ danych (flow)
7. Mapowanie typów TS → modeli Django
8. Częste błędy

---

## 1. Struktura projektu

```
crypto-tracker/          ← ten folder (React)
  src/
    api/
      client.ts          ← Axios + interceptory JWT, wszystkie wywołania API
    components/
      auth/
        AuthPage.tsx     ← Login + Register (jeden widok)
      dashboard/
        Navbar.tsx
        StatsBar.tsx
      ui/
        index.tsx        ← Button, Input, Card, Badge, Spinner
      watchlist/
        AddCoinModal.tsx ← wyszukiwarka coinów
        CoinRow.tsx      ← wiersz tabeli z edycją notatki
        WatchlistTable.tsx
    context/
      AuthContext.tsx    ← globalny stan auth (user, login, logout)
    hooks/
      useWatchlist.ts    ← fetch + CRUD watchlisty, wyszukiwanie coinów
    pages/
      Dashboard.tsx      ← główna strona po zalogowaniu
    types/
      index.ts           ← WSZYSTKIE interfejsy TS odpowiadające JSON z backendu
    utils/
      format.ts          ← formatPrice, formatPercent, formatMarketCap, formatDate
    App.tsx              ← routing guard (auth → Dashboard, else → AuthPage)
    main.tsx
    index.css
```

---

## 2. Uruchomienie frontendu

```bash
cd crypto-tracker
cp .env.example .env          # opcjonalnie edytuj VITE_API_URL
npm install
npm run dev                   # http://localhost:5173
```

Vite **proxy** przekierowuje `/api/*` → `http://localhost:8000` — nie
musisz się martwić o CORS podczas developmentu (patrz sekcja 5).

---

## 3. Wymagane endpointy Django

Frontend wywołuje dokładnie te ścieżki. Dostosuj `urls.py` do poniższej tabeli.

| Metoda   | URL                          | Opis                                              |
|----------|------------------------------|---------------------------------------------------|
| POST     | `/api/auth/register/`        | Rejestracja; zwraca `{user, tokens}`              |
| POST     | `/api/auth/login/`           | Logowanie; zwraca `{user, tokens}`                |
| POST     | `/api/auth/logout/`          | Body: `{refresh}`; blacklistuje token             |
| POST     | `/api/auth/token/refresh/`   | Body: `{refresh}`; zwraca `{access}`              |
| GET      | `/api/watchlist/`            | Lista coinów usera + dane z CoinGecko             |
| POST     | `/api/watchlist/`            | Body: `{coin_id, notes?}`; dodaje coin            |
| PATCH    | `/api/watchlist/<uuid:id>/`  | Body: `{notes}`; edytuje notatkę                  |
| DELETE   | `/api/watchlist/<uuid:id>/`  | Usuwa wpis                                        |
| GET      | `/api/coins/?search=<query>` | Proxy do CoinGecko — lista coinów do wyszukania   |

### Kształt JSON odpowiedzi (musi być zgodny z `src/types/index.ts`)

**POST /api/auth/login/** i **POST /api/auth/register/**
```json
{
  "user": {
    "id": 1,
    "username": "satoshi",
    "email": "s@example.com",
    "is_active": true
  },
  "tokens": {
    "access": "<JWT access token>",
    "refresh": "<JWT refresh token>"
  }
}
```

**GET /api/watchlist/**
```json
{
  "watchlist": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": 1,
      "coin_id": "bitcoin",
      "added_at": "2024-01-15T10:30:00Z",
      "notes": "mój core holding",
      "market": {
        "id": "bitcoin",
        "symbol": "btc",
        "name": "Bitcoin",
        "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        "current_price": 67000.0,
        "price_change_percentage_24h": 2.45,
        "market_cap": 1320000000000,
        "total_volume": 28000000000,
        "high_24h": 68000.0,
        "low_24h": 65000.0
      }
    }
  ]
}
```

> Jeśli CoinGecko nie zwróci danych dla danego `coin_id`, ustaw `"market": null`.

**GET /api/coins/?search=bit**
```json
{
  "coins": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
    }
  ]
}
```

---

## 4. Konfiguracja JWT w Django

Zainstaluj `djangorestframework-simplejwt`:

```bash
pip install djangorestframework-simplejwt
```

**settings.py**
```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # wymagane do logout
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

**Przykładowe views (auth/views.py)**
```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from .serializers import UserSerializer, RegisterSerializer

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'detail': 'Invalid credentials'}, status=400)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        })

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=201)

class LogoutView(APIView):
    def post(self, request):
        try:
            token = RefreshToken(request.data['refresh'])
            token.blacklist()
        except (TokenError, KeyError):
            pass
        return Response(status=204)
```

**auth/serializers.py**
```python
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
```

---

## 5. CORS

```bash
pip install django-cors-headers
```

**settings.py**
```python
INSTALLED_APPS = [..., 'corsheaders']

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # MUSI być przed CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    ...
]

# Development — zezwól na localhost Vite
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

# Produkcja — zmień na domenę frontendu
# CORS_ALLOWED_ORIGINS = ["https://your-frontend.com"]
```

> Podczas dev z Vite proxy CORS nie jest wymagane (zapytania idą przez :8000),
> ale skonfiguruj od razu — przyda się na produkcji.

---

## 6. Przepływ danych (flow)

```
LOGOWANIE
─────────
User wpisuje login/hasło
  → AuthPage.tsx handleSubmit()
    → authApi.login()  [POST /api/auth/login/]
      ← {user, tokens}
        → saveTokens()  [localStorage]
        → setUser()     [AuthContext]
          → App.tsx renderuje Dashboard
                            ↓
WATCHLISTA
──────────
Dashboard montuje się
  → useWatchlist.fetch()  [GET /api/watchlist/]
    ← {watchlist: [...]}
      → setCoins()  [state]
        → WatchlistTable renderuje CoinRow × N

DODANIE COINA
─────────────
User klika "+ ADD COIN"
  → AddCoinModal pojawia się
    → User wpisuje "eth"
      → useCoinSearch.search("eth")  [GET /api/coins/?search=eth]
        ← {coins: [...]}
          → wyświetla wyniki
            → User klika "+ ADD"
              → watchlistApi.add({coin_id: "ethereum"})  [POST /api/watchlist/]
                ← WatchlistCoin (z market data)
                  → setCoins(prev => [...prev, newEntry])
                    → tabela odświeża się

EDYCJA NOTATKI
──────────────
User klika ✎ w CoinRow
  → editingNote = true → textarea
    → User klika SAVE
      → watchlistApi.update(id, {notes})  [PATCH /api/watchlist/<id>/]
        ← updated WatchlistCoin
          → setCoins(prev => prev.map(...))

USUNIĘCIE
─────────
User klika ✕ w CoinRow
  → confirm dialog
    → watchlistApi.remove(id)  [DELETE /api/watchlist/<id>/]
      → setCoins(prev => prev.filter(...))

ODŚWIEŻENIE TOKENA
──────────────────
Axios interceptor (client.ts) łapie każdy 401
  → POST /api/auth/token/refresh/  {refresh}
    ← {access}
      → saveTokens() z nowym access
        → ponawia oryginalne żądanie
```

---

## 7. Mapowanie typów TS → modeli Django

| TypeScript (`src/types/index.ts`) | Django model / serializer          |
|-----------------------------------|------------------------------------|
| `User`                            | `AbstractUser` + `UserSerializer`  |
| `AuthTokens`                      | `simplejwt` tokens dict            |
| `WatchlistEntry`                  | `WatchlistItem` model              |
| `WatchlistCoin`                   | `WatchlistItem` + CoinGecko merge  |
| `CoinMarketData`                  | CoinGecko `/coins/markets` item    |
| `AvailableCoin`                   | CoinGecko `/coins/list` item       |

Klucze JSON **muszą być identyczne** — Django REST Framework domyślnie
używa `snake_case`, co jest zgodne z typami TS w tym projekcie.

---

## 8. Częste błędy

| Objaw                                   | Przyczyna                               | Rozwiązanie                                      |
|-----------------------------------------|-----------------------------------------|--------------------------------------------------|
| `401` na każde żądanie po zalogowaniu   | Brak `Authorization: Bearer` w nagłówku | Sprawdź interceptor w `client.ts`               |
| `CORS error` w przeglądarce             | `corsheaders` nie skonfigurowany        | Sekcja 5                                        |
| `market: null` dla wszystkich coinów    | Backend nie odpytuje CoinGecko w GET    | Zaimplementuj merge w `WatchlistViewSet.list()`  |
| Coin można dodać dwa razy               | Brak `UniqueConstraint` lub walidacji   | Django: `unique_together = ('user', 'coin_id')`  |
| Token nie odświeża się, redirect /login | `BLACKLIST_AFTER_ROTATION = False`      | Włącz w `SIMPLE_JWT` settings                   |
| `TypeScript: Property 'X' missing`      | Backend zwraca inne pole niż w typach   | Wyrównaj klucze z `src/types/index.ts`           |
