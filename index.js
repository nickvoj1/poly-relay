const express = require('express');
const app = express();
app.use(express.json({limit: '50mb'}));

// Health
app.get('/health', (req, res) => res.json({live: true, timestamp: Date.now()}));

// Gamma proxy
app.all('/gamma/*', async (req, res) => {
  const path = req.path.replace('/gamma', '') + (req.url.includes('?') ? `?${req.url.split('?')[1]}` : '');
  const url = `https://gamma-api.polymarket.com${path}`;
  const response = await fetch(url, {headers: req.headers});
  res.json(await response.json());
});

// Clob order proxy  
app.post('/order', async (req, res) => {
  const response = await fetch('https://clob.polymarket.com/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...req.headers
    },
    body: JSON.stringify(req.body)
  });
  const data = await response.json();
  res.status(response.status).json(data);
});

// Catch-all proxy
app.all('*', async (req, res) => {
  const target = req.path.startsWith('/gamma') ? 'gamma-api.polymarket.com' : 'clob.polymarket.com';
  const url = `https://${target}${req.originalUrl}`;
  const response = await fetch(url, {
    method: req.method,
    headers: req.headers,
    body: ['POST','PUT'].includes(req.method) ? JSON.stringify(req.body) : undefined
  });
  res.status(response.status).json(await response.json());
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy live on ${port}`));
