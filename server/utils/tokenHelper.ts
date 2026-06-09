import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing');
  }
  return jwt.sign({ id: userId }, secret, {
    expiresIn: (process.env.JWT_EXPIRE || '1d') as any,
  });
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is missing');
  }
  return jwt.sign({ id: userId }, secret, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRE || '7d') as any,
  });
};

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing');
  }
  return jwt.verify(token, secret);
};

export const verifyRefreshToken = (token: string): any => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is missing');
  }
  return jwt.verify(token, secret);
};
