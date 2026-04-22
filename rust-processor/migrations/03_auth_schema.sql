CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed users:
-- admin@payment.local / admin123
-- analyst@payment.local / analyst123
-- viewer@payment.local / viewer123

INSERT INTO users (id, email, password_hash)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@payment.local', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa'),
  ('00000000-0000-0000-0000-000000000002', 'analyst@payment.local', '$2b$10$tZ2zMvYl5JqTz5Y/ETo9dO5G1B.P8K97tP25aZ/N5E/jC3K7yE79O'),
  ('00000000-0000-0000-0000-000000000003', 'viewer@payment.local', '$2b$10$9GvB0pS62R.w/cZkI99UZeKQ3b5/9iP./e7N/Xp2o0mB11/iQ28/y')
ON CONFLICT DO NOTHING;
