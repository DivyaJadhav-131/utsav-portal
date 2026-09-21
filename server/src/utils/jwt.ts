import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production';
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

export interface JwtPayload {
  userId: string;
  role: string;
}

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, SECRET) as JwtPayload;
