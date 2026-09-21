"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const auth_validator_1 = require("../validators/auth.validator");
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};
const signup = async (req, res) => {
    const result = auth_validator_1.signupSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ message: result.error.errors[0].message });
        return;
    }
    const { name, email, password } = result.data;
    const exists = await User_1.default.findOne({ email });
    if (exists) {
        res.status(409).json({ message: 'Email already registered' });
        return;
    }
    const passwordHash = await bcrypt_1.default.hash(password, 12);
    // Role is always 'student' on public signup — never read from request body
    const user = await User_1.default.create({ name, email, passwordHash, role: 'student' });
    const token = (0, jwt_1.signToken)({ userId: user._id.toString(), role: user.role });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    });
};
exports.signup = signup;
const login = async (req, res) => {
    const result = auth_validator_1.loginSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ message: result.error.errors[0].message });
        return;
    }
    const { email, password } = result.data;
    const user = await User_1.default.findOne({ email });
    if (!user) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }
    const match = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!match) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }
    const token = (0, jwt_1.signToken)({ userId: user._id.toString(), role: user.role });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
};
exports.login = login;
const logout = (_req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const getMe = async (req, res) => {
    const user = await User_1.default.findById(req.user.userId).select('-passwordHash');
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    res.json(user);
};
exports.getMe = getMe;
