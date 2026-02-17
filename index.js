const express = require('express');
const app = express();
app.use(express.json());

app.post('/order', async (req, res) => {
  try {
    const response = await fetch('https://clob.polymarket.com/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.get('/health', (req, res) => res.json({status: 'live'}));
app.get('/gamma/:path*', async (req, res) => {
  const url = `https://gamma-api.polymarket.com/${req.params.path}${req.url.includes('?') ? req.url.split('?')[1] : ''}`;
  const response = await fetch(url);
  res.json(await response.json());
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Relay live on port ${port}`));
