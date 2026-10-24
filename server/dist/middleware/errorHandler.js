"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const multer_1 = __importDefault(require("multer"));
const errorHandler = (err, _req, res, 
// Express requires the four-argument shape to identify error middleware.
_next) => {
    console.error('[Error]', err.message);
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ message: 'Image must not exceed 4 MB' });
            return;
        }
        res.status(400).json({ message: err.message });
        return;
    }
    if (err.message === 'Only JPEG, PNG and WebP images are allowed') {
        res.status(400).json({ message: err.message });
        return;
    }
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error' });
};
exports.errorHandler = errorHandler;
