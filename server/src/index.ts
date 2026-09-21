import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { connectDatabase } from './utils/database';
import { serveImage } from './utils/imageStorage';

import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import registrationRoutes from './routes/registration.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;
app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Reuse the database connection and wait for it before handling requests.
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) res.setHeader('Cache-Control', 'no-store');
  Promise.resolve().then(connectDatabase).then(() => next()).catch(() => {
    res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });
  });
});
app.get('/api/health', (_req, res) => { res.json({ status: 'ok' }); });
app.get('/uploads/events/:filename', serveImage);

// ── Static uploads ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

app.use((_req, res) => { res.status(404).json({ message: 'Not found' }); });

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// Only the local process opens a port; Vercel invokes the exported app.
if (!process.env.VERCEL && require.main === module) {
  connectDatabase().then(() => {
    app.listen(PORT, () => console.log(`Utsav API listening on port ${PORT}`));
  }).catch(() => {
    console.error('Could not connect to MongoDB. Check server environment settings.');
    process.exitCode = 1;
  });
}

export default app;
