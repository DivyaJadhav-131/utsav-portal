const fs = require('node:fs');
const path = require('node:path');

const source = path.resolve(__dirname, '../src');
const destination = path.resolve(__dirname, '../dist');

// Vercel and the local start command load the same JavaScript build.
fs.cpSync(source, destination, {
  recursive: true,
  filter: (entry) => fs.statSync(entry).isDirectory() || entry.endsWith('.js'),
});
