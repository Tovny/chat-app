import { hash } from 'bcrypt';
import { NextFunction, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { User } from '../entity/User.model';
import { Request } from '../types';
import { SqlDataSource } from '../utils/db.util';
import { ResponseError } from '../utils/response-error.util';

export const postLogin = async (req: Request, res: Response) => {
    delete req.foundUser.password;
    const token = sign(JSON.stringify(req.foundUser), process.env.JWT_SECRET);
    res.json(token);
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
