const http = require('http');

const GAS_URL = 'script.google.com';
const GAS_PATH = '/macros/s/AKfycbxsNEYdTVX5mvIJTcMz1WfzIFjonksMxYaRYTR7ZIQy4Gv7S3ajjnOd0KQmHiTjJ0_z/exec';

const server = http.createServer((req, res) => {
  // Set CORS headers untuk semua response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/submit') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      console.log('→ Forwarding to GAS...');

      const options = {
        hostname: GAS_URL,
        path: GAS_PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const proxyReq = http.request(options, (proxyRes) => {
        let responseData = '';
        proxyRes.on('data', chunk => responseData += chunk);
        proxyRes.on('end', () => {
          console.log('← GAS Response:', proxyRes.statusCode);
          res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
          res.end(responseData);
        });
      });

      proxyReq.on('error', (err) => {
        console.error('Error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      });

      proxyReq.write(body);
      proxyReq.end();
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Find available port
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`
🚀 Proxy server aktif!
   URL: http://localhost:${PORT}/api/submit
   GAS: https://${GAS_URL}${GAS_PATH}
`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} digunakan, coba port lain...`);
  }
});