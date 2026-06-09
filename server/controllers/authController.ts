import { Request, Response, NextFunction } from 'express';

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.user is populated by protect middleware
    res.json({
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const register = (req: Request, res: Response): any => 
  res.status(400).json({ message: 'Auth handled directly via Supabase Auth Client' });

export const login = (req: Request, res: Response): any => 
  res.status(400).json({ message: 'Auth handled directly via Supabase Auth Client' });

export const refresh = (req: Request, res: Response): any => 
  res.status(400).json({ message: 'Auth handled directly via Supabase Auth Client' });
