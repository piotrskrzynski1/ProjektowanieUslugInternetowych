
## 🪙 CryptoTracker — Dokumentacja Backendowa i Instrukcja Konfiguracji

Ten dokument opisuje serwerową część aplikacji do śledzenia kryptowalut, zrealizowaną w technologii Python 3.14+ oraz Django REST Framework.
🏗️ Architektura Systemu

Backend został zaprojektowany jako RESTful API  i realizuje trzy kluczowe funkcje:

    Autentykacja (JWT): Wykorzystuje bibliotekę djangorestframework-simplejwt. Serwer generuje dwa rodzaje tokenów: access (do autoryzacji zapytań) oraz refresh (do odświeżania sesji).

    Zarządzanie listą (CRUD): Przechowywanie powiązań User <-> Coin_ID w bazie danych. Obsługuje operacje tworzenia, odczytu, aktualizacji notatek oraz usuwania.

    Agregacja danych (API Proxy): Backend działa jako pośrednik między frontendem a zewnętrznym API CoinGecko. Podczas pobierania listy, serwer łączy dane z bazy z aktualnymi kursami rynkowymi.

## 🚀 Szybki Start (Instalacja)

Postępuj zgodnie z poniższymi krokami, aby uruchomić projekt na nowym komputerze.

### 1. Przygotowanie środowiska
Upewnij się, że masz zainstalowane:
* **Python 3.10+**
* **Node.js & npm** (do obsługi frontendu)

### 2. Konfiguracja Backendu
Otwórz terminal w folderze `Backend`:
```bash
# Instalacja wymaganych bibliotek
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers requests

# Przygotowanie bazy danych (SQLite)
python manage.py makemigrations crypto_api
python manage.py migrate

# Uruchomienie serwera
python manage.py runserver

Serwer będzie dostępny pod adresem: http://127.0.0.1:8000
3. Konfiguracja Frontendu

W nowym oknie terminala przejdź do folderu Frontend:
Bash

# Instalacja zależności
npm install

# Uruchomienie trybu deweloperskiego
npm run dev

Interfejs będzie dostępny pod adresem: http://localhost:5173.

```
## 🧪 Dane testowego użytkownika


Aby przetestować system bez konieczności ręcznej rejestracji, możesz użyć poniższych danych (możesz je stworzyć w formularzu rejestracji):

    Nazwa użytkownika (Login): bla

    Email: bla@gmail.com

    Hasło: 1234567890

## Hasło musi byc dlugosci 8+ symboli

## 🛠️ Główne Endpointy API
Metoda	URL	Opis
POST	/api/auth/register/	Rejestracja nowego konta
POST	/api/auth/login/	Logowanie и pobranie tokenów JWT
GET	/api/watchlist/	Lista obserwowanych walut z cenami rynkowymi
POST	/api/watchlist/	Dodanie nowej waluty do listy (coin_id)
GET	/api/coins/?search=...	Wyszukiwanie dostępnych walut w CoinGecko
Jak to działa? (Logika Merge)

Kiedy frontend wysyła zapytanie do /api/watchlist/, dzieje się co następuje:

    Django pobiera wszystkie wpisy z tabeli WatchlistItem dla zalogowanego użytkownika.

    Zbiera wszystkie identyfikatory coin_id (np. bitcoin,ethereum).

    Wysyła jedno zapytanie do api.coingecko.com.

    Łączy dane: do każdego wpisu z bazy dołączany jest obiekt market z aktualną ceną i zmianami procentowymi.

    Frontend otrzymuje kompletną listę gotową do wyświetlenia.