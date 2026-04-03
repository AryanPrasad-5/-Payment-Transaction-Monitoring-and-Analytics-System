CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    merchant_id VARCHAR(255) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merchant_stats (
    merchant_id VARCHAR(255) PRIMARY KEY,
    total_transactions BIGINT NOT NULL DEFAULT 0,
    failed_transactions BIGINT NOT NULL DEFAULT 0,
    total_volume DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_summary (
    date DATE PRIMARY KEY,
    total_transactions BIGINT NOT NULL DEFAULT 0,
    failed_transactions BIGINT NOT NULL DEFAULT 0,
    total_volume DOUBLE PRECISION NOT NULL DEFAULT 0.0
);


INSERT INTO merchant_stats (merchant_id, total_transactions, failed_transactions, total_volume)
VALUES 
    ('M456', 0, 0, 0.0),
    ('M123', 0, 0, 0.0),
    ('M789', 0, 0, 0.0)
ON CONFLICT DO NOTHING;
