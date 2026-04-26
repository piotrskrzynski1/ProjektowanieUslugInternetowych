-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRYPTOCURRENCY
CREATE TABLE cryptocurrency (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    coingecko_id VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WATCHLIST
CREATE TABLE watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    cryptocurrency_id UUID NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_crypto
        FOREIGN KEY(cryptocurrency_id)
        REFERENCES cryptocurrency(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_crypto
        UNIQUE(user_id, cryptocurrency_id)
);

-- PRICE HISTORY
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cryptocurrency_id UUID NOT NULL,
    price_usd NUMERIC(20,8) NOT NULL,
    market_cap NUMERIC(20,2),
    volume_24h NUMERIC(20,2),
    recorded_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_price_crypto
        FOREIGN KEY(cryptocurrency_id)
        REFERENCES cryptocurrency(id)
        ON DELETE CASCADE
);

-- INDEXES
CREATE INDEX idx_crypto_symbol ON cryptocurrency(symbol);
CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_watchlist_crypto ON watchlist(cryptocurrency_id);
CREATE INDEX idx_price_crypto_time 
    ON price_history(cryptocurrency_id, recorded_at DESC);

-- VIEWS
CREATE VIEW user_watchlist_view AS
SELECT 
    u.username,
    c.name,
    c.symbol,
    w.added_at
FROM watchlist w
JOIN users u ON w.user_id = u.id
JOIN cryptocurrency c ON w.cryptocurrency_id = c.id;