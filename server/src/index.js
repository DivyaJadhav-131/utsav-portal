"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./utils/database");
const imageStorage_1 = require("./utils/imageStorage");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const registration_routes_1 = __importDefault(require("./routes/registration.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
}
// ── Middleware ────────────────────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Reuse the database connection and wait for it before handling requests.
app.use((req, res, next) => {
    if (req.path.startsWith('/api'))
        res.setHeader('Cache-Control', 'no-store');
    Promise.resolve().then(database_1.connectDatabase).then(() => next()).catch(() => {
        res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });
    });
});
app.get('/api/health', (_req, res) => { res.json({ status: 'ok' }); });
app.get('/uploads/events/:filename', imageStorage_1.serveImage);
// ── Static uploads ────────────────────────────────────────────────────────────
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/events', event_routes_1.default);
app.use('/api/registrations', registration_routes_1.default);
app.use((_req, res) => { res.status(404).json({ message: 'Not found' }); });
// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// Only the local process opens a port; Vercel invokes the exported app.
if (!process.env.VERCEL && require.main === module) {
    (0, database_1.connectDatabase)().then(() => {
        app.listen(PORT, () => console.log(`Utsav API listening on port ${PORT}`));
    }).catch(() => {
        console.error('Could not connect to MongoDB. Check server environment settings.');
        process.exitCode = 1;
    });
}
exports.default = app;
