
INSERT INTO transactions (id, transaction_id, merchant_id, amount, status, payment_method, created_at)
SELECT
    gen_random_uuid(), 
    'TXN-' || substr(md5(random()::text), 1, 10), 
    
    (ARRAY['M456', 'M123', 'M789'])[floor(random() * 3 + 1)],
    
    round((random() * 1000 + 10)::numeric, 2),
    
    (ARRAY['SUCCESS', 'FAILED', 'PENDING'])[floor(random() * 3 + 1)],
    
    (ARRAY['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER'])[floor(random() * 3 + 1)],
    
    NOW() - (random() * interval '30 days')
FROM generate_series(1, 1000);


INSERT INTO daily_summary (date, total_transactions, failed_transactions, total_volume)
SELECT 
    CURRENT_DATE - i,
    floor(random() * 500 + 50)::bigint,
    floor(random() * 50 + 5)::bigint,
    round((random() * 50000 + 1000)::numeric, 2)
FROM generate_series(0, 30) AS i
ON CONFLICT DO NOTHING;

UPDATE merchant_stats
SET 
    total_transactions = floor(random() * 1000 + 100)::bigint,
    failed_transactions = floor(random() * 100 + 10)::bigint,
    total_volume = round((random() * 100000 + 5000)::numeric, 2),
    updated_at = NOW()
WHERE merchant_id IN ('M456', 'M123', 'M789');
