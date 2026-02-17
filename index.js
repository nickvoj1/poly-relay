import express from 'express';
const app = express();
app.use(express.json());

app.post('/order', async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch('https://clob.polymarket.com/order', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(req.body),
      signal: controller.signal
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({error: e.message});
  } finally {
    clearTimeout(timeout);
  }
});

app.get('/health', (req, res) => res.json({status: 'live'}));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Relay on ${port}`));
