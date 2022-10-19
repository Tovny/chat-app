import { hash } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { User } from '../entity/User.model';
import { SqlDataSource } from '../utils/db.util';
import { ResponseError } from '../utils/response-error.util';

export const postLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { username } = req.body;
    try {
        const user = await SqlDataSource.getRepository(User)
            .createQueryBuilder('user')
            .select(['user.id', 'user.username', 'user.email'])
            .where('user.username = :username', { username })
            .getOne();
        const token = sign(JSON.stringify(user), process.env.JWT_SECRET);
        res.json(token);
    } catch (err) {
        next(new ResponseError(err.message, 500));
    }
};

export const postRegister = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { username, password, email } = req.body;
    const repo = SqlDataSource.getRepository(User);
    try {
        const hashedPass = await hash(
            password,
            Number(process.env.HASH_ROUNDS)
        );
        const user = repo.create({ username, password: hashedPass, email });
        const dbUser = await repo.save(user);
        delete dbUser.password;
        res.json(dbUser);
    } catch (err) {
        next(new ResponseError(err.message, 500));
    }
};
