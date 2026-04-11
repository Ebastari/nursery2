// Proxy server for local development (CommonJS)
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3001; // Port proxy
const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw.../exec'; // Ganti dengan URL Apps Script Anda

app.use(cors());
app.use(express.json());

// Proxy POST ke Apps Script
app.post('/api/proxy', async (req, res) => {
  try {
    const response = await fetch(APPSCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
