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
  users: [], // Seeded asynchronously below
  merchant_stats: { gross_volume: 500000, total_tx: 19678, failed_tx: 2085 },
  transactions: [
    { id: 'tx-1', amount: 1540.00, status: 'SUCCESS', method: 'UPI', date: new Date().toISOString() },
    { id: 'tx-2', amount: 350.50, status: 'FAILED', method: 'CREDIT_CARD', date: new Date(Date.now() - 3600000).toISOString() },
    { id: 'tx-3', amount: 999.00, status: 'SUCCESS', method: 'NET_BANKING', date: new Date(Date.now() - 7200000).toISOString() }
  ]
};

// Seed multiple users
async function seedUsers() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const analystHash = await bcrypt.hash('analyst123', 10);
  const viewerHash = await bcrypt.hash('viewer123', 10);

  MOCK_DB.users.push(
    { id: 'u-1', email: 'admin@payment.local', password_hash: adminHash, role: 'Admin' },
    { id: 'u-2', email: 'analyst@payment.local', password_hash: analystHash, role: 'Analyst' },
    { id: 'u-3', email: 'viewer@payment.local', password_hash: viewerHash, role: 'Viewer' }
  );
  console.log("Mock Users successfully seeded.");
}

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

const PORT = 3000;
app.listen(PORT, async () => {
    await seedUsers();
    console.log(`Mock InMemory Dashboard API Gateway running on port ${PORT}`);
});
