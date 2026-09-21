import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { signToken } from '../utils/jwt';
import { signupSchema, loginSchema } from '../validators/auth.validator';
import { AuthRequest } from '../middleware/authenticate';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: result.error.errors[0].message });
    return;
  }
  const { name, email, password } = result.data;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409).json({ message: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // Role is always 'student' on public signup — never read from request body
  const user = await User.create({ name, email, passwordHash, role: 'student' });

  const token = signToken({ userId: user._id.toString(), role: user.role });
  res.cookie('token', token, COOKIE_OPTIONS);
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: result.error.errors[0].message });
    return;
  }
  const { email, password } = result.data;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });
  res.cookie('token', token, COOKIE_OPTIONS);
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.userId).select('-passwordHash');
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json(user);
};
