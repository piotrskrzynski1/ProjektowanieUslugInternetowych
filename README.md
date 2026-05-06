## Aplikacja do śledzenia kryptowalut

### 📌 Funkcjonalności

- **Rejestracja / logowanie**
  - Użytkownicy mogą się rejestrować i logować.
  - Możliwość zapisywania ulubionych kryptowalut.

- **CRUD**
  - Dodawanie kryptowalut do listy obserwowanych.
  - Edycja danych obserwowanych kryptowalut.
  - Usuwanie kryptowalut z listy.

- **Kryptowaluty**
  - Backend pobiera aktualne dane o cenach kryptowalut z zewnętrznego API (np. CoinGecko).
  - Dane zwracane są w formacie JSON.

- **Frontend**
  - Przeglądanie aktualnych cen kryptowalut.
  - Zarządzanie listą obserwowanych walut.

---

### 🛠️ Zadania

#### Backend
- Obsługa rejestracji i logowania użytkowników.
- Implementacja operacji CRUD dla ulubionych kryptowalut.
- Integracja z zewnętrznym API do pobierania kursów kryptowalut.
- Udostępnienie REST API zwracającego dane w formacie JSON.

#### Frontend
- Interfejs do rejestracji i logowania.
- Widok listy kryptowalut wraz z aktualnymi cenami.
- Możliwość dodawania kryptowalut do obserwowanych.
- Zarządzanie (edycja/usuwanie) listą obserwowanych kryptowalut.


---

### 🤝 Jak pracujemy

## 🌿 Branch

Nie pracuj na `main`.

Twórz branch:

```bash
git checkout -b feature/nazwa-zmiany
backend/pskrzynski -> backend mój
frontend/ykaleniskau -> frontend yahora
```

Teraz bezpiecznie pracujecie na własnej wersji projektu i jak coś zepsujecie nie wpływa to na mastera/maina

## 💾 Commit

```bash
git add .
git commit -m "Opis zmian"
```

Tak bierzecie wszystkie zmienione pliki na swoim branchu i zapisujecie je do gita (git lokalny github zdalny)

## Push
```bash
git push origin nazwa-branchu
```
Po commicie, możecie zpushować, wtedy wysyłacie to na naszego githuba

## Pull Request
Zpushowane branche mogą zostać, ale żeby weszły do maina (finalnej wersji projektu) trzeba
1. Wejść na github
2. Kliknąć "Compare & Pull Request"
3. Wybrać main <- branch
4. Kliknąć "Create Pull Request"
Wtedy ja sobie to oglądam i daje okejke jak bedzie git i ostatecznie trafia do projektu

W pull request fajnie jak napiszecie w skrócie co dodaliście

## Forcowanie

Jeżeli chcecie zmienić ostatni commit żęby nie śmiecić to używajcie

```bash
git branch  \<- upewnijcie sie że jesteście na swoim branchu a nie mainie, chociaż git raczej was zatrzyma bo nie macie pełnego prawa do repo
git commit --amend --no-edit
git push --force-with-lease
```