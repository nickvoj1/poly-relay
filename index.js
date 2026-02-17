const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const RELAY_SECRET = process.env.RELAY_SECRET || "";

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  if (RELAY_SECRET && req.headers["x-relay-secret"] !== RELAY_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: Date.now() });
});

app.post("/order", async (req, res) => {
  const { order, headers: polyHeaders } = req.body;
  if (!order || !polyHeaders) return res.status(400).json({ error: "Missing order or headers" });
  try {
    const resp = await fetch("https://clob.polymarket.com/order", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...polyHeaders },
      body: JSON.stringify(order),
    });
    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    res.status(resp.status).json({ success: resp.ok, status: resp.status, data, orderID: data?.orderID || null });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => console.log(`Relay on port ${PORT}`));
