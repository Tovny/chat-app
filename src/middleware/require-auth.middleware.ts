import { Response, NextFunction } from 'express';
import { Request } from '../types';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        return res.status(403).send('User not found.');
    }
    next();
}
