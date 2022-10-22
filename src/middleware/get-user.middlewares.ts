import { NextFunction, Response } from 'express';
import { User } from '../entity/User.model';
import { Request } from '../types';
import { SqlDataSource } from '../config/db.config';
import { decodeUserJwt } from '../utils/decode-user-jwt.util';
import { client } from '../utils/redis.util';

export async function getUser(req: Request, _: Response, next: NextFunction) {
    const token = decodeUserJwt(req.headers.authorization);
    if (!token) {
        return next();
    }

    let user = JSON.parse(await client.get(token.id));
    if (!user) {
        user = await SqlDataSource.getRepository(User).findOneBy({
            id: `${token.id}`,
        });
        client.set(token.id, JSON.stringify(user), { EX: 60 * 30 });
    }

    req.user = user;
    next();
}

export async function getUserByUsernameOrEmail(
    req: Request,
    _: Response,
    next: NextFunction
) {
    const { username, email } = req.body;
    const user = await SqlDataSource.getRepository(User)
        .createQueryBuilder('user')
        .where('username = :username OR email = :email', {
            username,
            email,
        })
        .getOne();
    req.foundUser = user;
    next();
}
