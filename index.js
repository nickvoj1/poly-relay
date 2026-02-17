const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

app.post('/order', async (req, res) => {
  const response = await fetch('https://clob.polymarket.com/order', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(req.body)
  });
  res.json(await response.json());
});

app.get('/health', (req, res) => res.json({live: true}));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Relay on ${port}`));
