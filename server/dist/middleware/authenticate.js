"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    try {
        req.user = (0, jwt_1.verifyToken)(token);
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
