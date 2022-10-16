import { NextFunction, Request, Response } from 'express';

export const cors = (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPGRADE');
    res.header('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        return res.status(200);
    }

    next();
};
