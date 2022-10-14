import { NextFunction, Response } from 'express';
import { User } from '../entity/User.model';
import { Request } from '../types';
import { SqlDataSource } from '../utils/db.util';
import { decodeUserJwt } from '../utils/decode-user-jwt.util';

export async function getUser(req: Request, _: Response, next: NextFunction) {
    const token = decodeUserJwt(req.headers.authorization);
    if (!token) {
        return next();
    }
    const user = await SqlDataSource.getRepository(User).findOneBy({
        id: `${token.id}`,
    });
    req.user = user;
    next();
}
