import { Response, NextFunction } from 'express';
import { Request } from '../types';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        return res.sendStatus(401);
    }
    next();
}
