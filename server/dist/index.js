"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const registration_routes_1 = __importDefault(require("./routes/registration.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ── Middleware ────────────────────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// ── Static uploads ────────────────────────────────────────────────────────────
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/events', event_routes_1.default);
app.use('/api/registrations', registration_routes_1.default);
// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ── Database + Server ─────────────────────────────────────────────────────────
mongoose_1.default
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college_events')
    .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
})
    .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});
exports.default = app;
