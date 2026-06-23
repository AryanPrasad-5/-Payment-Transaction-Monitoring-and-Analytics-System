const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'super-secret-development-key';

// Mock InMemory Database
const MOCK_DB = {
  users: [
    { id: 'u-1', email: 'admin@payment.local', password_hash: '$2b$10$mthMHI349lEEMEGv2b5gwO44v/UhKp7Da1b0IqUdBz/8RmYMhNY9e', role: 'Admin' },
    { id: 'u-2', email: 'analyst@payment.local', password_hash: '$2b$10$w726ZpK2bEma9z2uJGcMTeyqPXtoTFr/.QI2qcvqMHclUY.lDITmq', role: 'Analyst' },
    { id: 'u-3', email: 'viewer@payment.local', password_hash: '$2b$10$6wda0VWK34pRKJJkwXnJd.2.h9LX2bneKqIwfrZBK2Z1Lfx4ey48e', role: 'Viewer' }
  ],
  merchant_stats: { gross_volume: 1250000, total_transactions: 15420, failed_transactions: 850 },
  transactions: [
    { transaction_id: 'tx-1', amount: 1540.00, status: 'SUCCESS', payment_method: 'UPI', created_at: new Date().toISOString() },
    { transaction_id: 'tx-2', amount: 350.50, status: 'FAILED', payment_method: 'CARD', created_at: new Date(Date.now() - 3600000).toISOString() },
    { transaction_id: 'tx-3', amount: 999.00, status: 'SUCCESS', payment_method: 'WALLET', created_at: new Date(Date.now() - 7200000).toISOString() },
    { transaction_id: 'tx-4', amount: 4500.00, status: 'FAILED', payment_method: 'UPI', created_at: new Date(Date.now() - 86400000).toISOString() },
    { transaction_id: 'tx-5', amount: 120.00, status: 'SUCCESS', payment_method: 'CARD', created_at: new Date(Date.now() - 90000000).toISOString() }
  ]
};

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access Denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid Token' });
    req.user = user;
    next();
  });
};

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
     const existingUser = MOCK_DB.users.find(u => u.email === email);
     if (existingUser) return res.status(400).json({ error: 'User already exists' });
     
     const password_hash = await bcrypt.hash(password, 10);
     const newUser = { id: `u-${Date.now()}`, email, password_hash, role: 'Viewer' };
     MOCK_DB.users.push(newUser);

     const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });
     setTimeout(() => { // simulate network latency
       res.json({ token, user: { email: newUser.email, id: newUser.id, role: newUser.role } });
     }, 800);
  } catch(e) {
     res.status(500).json({ error: e.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
     const user = MOCK_DB.users.find(u => u.email === email);
     if (!user) return res.status(401).json({ error: 'Invalid credentials' });
     
     const valid = await bcrypt.compare(password, user.password_hash);
     if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

     const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
     setTimeout(() => { // simulate network latency
       res.json({ token, user: { email: user.email, id: user.id, role: user.role } });
     }, 800);
  } catch(e) {
     res.status(500).json({ error: e.message });
  }
});

app.get('/api/analytics', authenticateToken, (req, res) => {
   const totalTx = MOCK_DB.merchant_stats.total_tx;
   const failedTx = MOCK_DB.merchant_stats.failed_tx;
   
   setTimeout(() => {
     res.json({
        grossVolume: MOCK_DB.merchant_stats.gross_volume,
        totalPayments: totalTx,
        failedPayments: failedTx,
        successRate: totalTx > 0 ? ((totalTx - failedTx) / totalTx) * 100 : 0
     });
   }, 500);
});

app.get('/api/transactions', authenticateToken, (req, res) => {
   setTimeout(() => {
     res.json(MOCK_DB.transactions);
   }, 400);
});

// V1 endpoints mapped for Vercel Mock Backend
app.get('/api/v1/transactions', authenticateToken, (req, res) => {
   const statusFilter = req.query.status;
   let filtered = MOCK_DB.transactions;
   if (statusFilter) {
      filtered = filtered.filter(t => t.status === statusFilter);
   }
   setTimeout(() => res.json({ count: filtered.length, data: filtered }), 300);
});

app.post('/api/v1/transactions', authenticateToken, (req, res) => {
   const { amount, status, payment_method } = req.body;
   const newTx = {
      transaction_id: `tx-${Date.now()}`,
      amount: amount || 0,
      status: status || 'SUCCESS',
      payment_method: payment_method || 'UNKNOWN',
      created_at: new Date().toISOString()
   };
   MOCK_DB.transactions.unshift(newTx);
   
   MOCK_DB.merchant_stats.total_transactions++;
   MOCK_DB.merchant_stats.gross_volume += newTx.amount;
   if (status === 'FAILED') MOCK_DB.merchant_stats.failed_transactions++;

   setTimeout(() => res.json({ message: 'Success', data: newTx }), 200);
});

app.get('/api/v1/merchants/:id/stats', authenticateToken, (req, res) => {
   setTimeout(() => res.json({ data: MOCK_DB.merchant_stats }), 300);
});

app.get('/api/v1/health', (req, res) => {
   res.json({ status: "ok" });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = 3000;
  app.listen(PORT, () => {
      console.log(`Mock InMemory Dashboard API Gateway running on port ${PORT}`);
  });
}

module.exports = app;
