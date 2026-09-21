// Build the existing TypeScript server before Vercel bundles this function.
module.exports = require('../server/dist/index.js').default;
