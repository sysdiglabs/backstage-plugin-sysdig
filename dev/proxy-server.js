/* eslint-disable no-console */
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 7007;

// Configuration from environment variables
const target = process.env.SYSDIG_SECURE_ENDPOINT;
const token = process.env.SYSDIG_SECURE_TOKEN;

if (!target || !token) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: SYSDIG_SECURE_ENDPOINT and SYSDIG_SECURE_TOKEN environment variables must be set.');
  console.log('Usage: SYSDIG_SECURE_ENDPOINT=... SYSDIG_SECURE_TOKEN=... node dev/proxy-server.js');
  process.exit(1);
}

// Enable CORS for the frontend (port 3000)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Sysdig-Product");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Proxy Middleware
app.use('/api/proxy/sysdig', createProxyMiddleware({
  target: target,
  changeOrigin: true,
  pathRewrite: {
    '^/api/proxy/sysdig': '', // Remove the prefix when forwarding
  },
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Sysdig-Product": "SDS"
  },
  onProxyRes: (proxyRes, req, _res) => {
     console.log(`[Proxy] ${req.method} ${req.path} -> ${target} [${proxyRes.statusCode}]`);
  },
  onError: (err, req, res) => {
    console.error(`[Proxy Error] ${err.message}`);
    res.status(500).send('Proxy Error');
  }
}));

app.listen(PORT, () => {
  console.log(`\x1b[32mSysdig Mock Backend running on http://localhost:${PORT}\x1b[0m`);
  console.log(`Forwarding /api/proxy/sysdig to ${target}`);
});
