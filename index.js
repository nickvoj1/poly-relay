const express = require('express');
const app = express();
app.use(express.json());

app.all('*', async (req, res) => {
  const url = 'https://' + (req.path.startsWith('/gamma') ? 'gamma-api.polymarket.com' : 'clob.polymarket.com') + req.originalUrl;
  const response = await fetch(url, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
  });
  res.status(response.status).json(await response.json());
});

app.listen(process.env.PORT || 3000);
