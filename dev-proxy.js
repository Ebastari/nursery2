// Simple Express proxy for Google Apps Script CORS bypass
// Jalankan: npm install express node-fetch

const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3001; // Port proxy

// Ganti dengan URL Apps Script Anda
defaultScriptUrl = 'https://script.google.com/macros/s/AKfycbwkAaMlchflrUhax7_RoKr0vDywMzz8kzG7b5iRC1PejoH7Zh3hTY3iMKftpaUOZH-s/exec';

app.use(express.json());

app.post('/api/submit', async (req, res) => {
  try {
    const response = await fetch(defaultScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const text = await response.text();
    res.set('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
