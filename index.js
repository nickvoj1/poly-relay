const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const app = express();

app.use(cors());
app.use(express.json({limit: '50mb'}));

const PRIVATE_KEY = process.env.POLYMARKET_PRIVATE_KEY;
const wallet = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY) : null;

// Health
app.get('/health', (req, res) => res.json({live: true}));

// Gamma proxy
app.all('/gamma/*', async (req, res) => {
  const url = `https://gamma-api.polymarket.com${req.originalUrl.replace('/gamma', '')}`;
  const response = await fetch(url);
  res.json(await response.json());
});

// Signed order proxy (Lovable uses this)
app.post('/order', async (req, res) => {
  if (!wallet) return res.status(400).json({error: 'No private key'});
  
  const { tokenID, price, size, side } = req.body.order || req.body;
  
  const order = {
    tokenID,
    price: Math.floor(price * 1e9),
    size: Math.floor(size * 1e9),
    side,
    timestamp: Math.floor(Date.now() / 1000),
  };
  
  const message = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(order)));
  const signature = await wallet.signMessage(ethers.getBytes(message));
  
  const response = await fetch('https://clob.polymarket.com/order', {
    method: 'POST
