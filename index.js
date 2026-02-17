const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({limit: '50mb'}));

// Health - Lovable checks this
app.get('/health', (req, res) => res.json({status: 'live', timestamp: Date.now()}));

// Gamma API proxy (read markets)
app.all('/gamma/*', async (req, res) => {
  const path = req.path.replace('/gamma', '') + new URLSearchParams(req.query).toString();
  const url = `https://gamma-api.polymarket.com${path}`;
  
  try {
    const response = await fetch(url);
    res.json(await response.json());
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

// CLOB Order proxy (Lovable bets)
app.post('/order', async (req, res) => {
  console.log('Order received:', JSON.stringify(req.body, null, 2));
  
  const response = await fetch('https://clob.polymarket.com/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Origin': 'https://polymarket.com',
      'Referer': 'https://polymarket.com/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site'
    },
    body: JSON.stringify(req.body)
  });
  
  const data = await response.json();
  console.log('Clob response:', data);
  res.status(response.status).json(data);
});

// Catch-all for other clob endpoints
app.all('*', async (req, res) => {
  const target = req.path.startsWith('/gamma') ? 'gamma-api.polymarket.com' : 'clob.polymarket.com';
  const url = `https://${target}${req.originalUrl}`;
  
  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://polymarket.com'
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined
    });
    res.status(response.status).json(await response.json());
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Poly Relay LIVE on port ${port}`);
  console.log(`🌐 Health: https://poly-relay-production-7585.up.railway.app/health`);
});
