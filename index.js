const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({live: true}));

app.all('*', async (req, res) => {
  try {
    const target = req.path.startsWith('/gamma') ? 'gamma-api.polymarket.com' : 'clob.polymarket.com';
    const url = `https://${target}${req.originalUrl}`;
    const response = await fetch(url);
    res.json(await response.json());
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// CRITICAL: Railway port binding
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Proxy LIVE on port ${port}`);
});
