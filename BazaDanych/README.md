🐳 Baza danych (PostgreSQL w Dockerze)

W projekcie używamy bazy danych PostgreSQL uruchamianej w kontenerze Docker.

Dzięki temu każdy członek zespołu ma identyczne środowisko bez konieczności instalowania bazy lokalnie.

🚀 Uruchomienie bazy danych
1. Uruchom kontener
docker-compose up -d
2. Sprawdź czy działa
docker ps

Powinieneś zobaczyć kontener crypto_db.

🧱 Struktura bazy

Schemat bazy znajduje się w pliku:

schema.sql

Aby go załadować:

docker exec -i crypto_db psql -U admin -d crypto < schema.sql
🔌 Dane do połączenia (dla backendu Django)

Backend (Django) powinien używać następującej konfiguracji:

HOST: localhost
PORT: 5432
DATABASE: crypto
USER: admin
PASSWORD: admin
⚙️ Przykładowa konfiguracja Django (settings.py)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'crypto',
        'USER': 'admin',
        'PASSWORD': 'admin',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
📌 Ważne informacje
Baza działa lokalnie w Dockerze
Nie trzeba instalować PostgreSQL ręcznie
Każdy developer pracuje na własnej instancji bazy
Dane nie są współdzielone między komputerami
🧪 Test połączenia

Po uruchomieniu bazy można wejść do środka:

docker exec -it crypto_db psql -U admin -d crypto