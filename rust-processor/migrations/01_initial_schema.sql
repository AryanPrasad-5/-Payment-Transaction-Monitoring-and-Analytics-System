CREATE TABLE IF NOT EXISTS transactions (
    transaction_id VARCHAR PRIMARY KEY,
    merchant_id VARCHAR NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('SUCCESS','FAILED')),
    payment_method VARCHAR(10) NOT NULL CHECK (payment_method IN ('UPI','CARD','WALLET')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merchant_stats (
    merchant_id VARCHAR PRIMARY KEY,
    total_transactions BIGINT NOT NULL DEFAULT 0,
    failed_transactions BIGINT NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    success_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS daily_summary (
    date DATE PRIMARY KEY,
    total_transactions BIGINT NOT NULL DEFAULT 0,
    failed_transactions BIGINT NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    success_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0
);

INSERT INTO merchant_stats (merchant_id, total_transactions, failed_transactions, total_amount, success_rate)
VALUES 
    ('M456', 0, 0, 0.0, 0.0),
    ('M123', 0, 0, 0.0, 0.0),
    ('M789', 0, 0, 0.0, 0.0)
ON CONFLICT DO NOTHING;
