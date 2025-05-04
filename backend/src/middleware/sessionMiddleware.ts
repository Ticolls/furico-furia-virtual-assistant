// src/middleware/sessionMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { conversationService } from '../services/conversationService';

declare global {
  namespace Express {
    interface Request {
      sessionId: string;
    }
  }
}

export const sessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let sessionId = req.cookies?.sessionId;
  
  if (!sessionId) {
    sessionId = conversationService.generateSessionId();
    
    res.cookie('sessionId', sessionId, {
      maxAge: 24 * 60 * 60 * 1000, 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }
  
  req.sessionId = sessionId;
  
  next();
};