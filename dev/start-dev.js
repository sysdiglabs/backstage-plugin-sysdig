/* eslint-disable no-console */
const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', 'Starting Sysdig Plugin Dev Environment...');

// 1. Start the Proxy Server
const proxyPath = path.join(__dirname, 'proxy-server.js');
const proxy = spawn('node', [proxyPath], {
  stdio: 'inherit',
  env: process.env
});

// 2. Start the Backstage Frontend
// We use 'yarn backstage-cli' directly to ensure we use the local version
const app = spawn('yarn', ['backstage-cli', 'package', 'start'], {
  stdio: 'inherit',
  env: process.env
});

// Handle cleanup
const cleanup = () => {
  console.log('\n\x1b[36m%s\x1b[0m', 'Shutting down processes...');
  proxy.kill();
  app.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// If one fails, kill the other?
proxy.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Proxy server exited with code ${code}`);
    cleanup();
  }
});
