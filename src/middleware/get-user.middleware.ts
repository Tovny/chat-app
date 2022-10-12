import { NextFunction, Response } from 'express';
import { User } from '../entity/User.model';
import { Request } from '../types';
import { SqlDataSource } from '../utils/db.util';

export async function getUser(req: Request, _: Response, next: NextFunction) {
    const user = await SqlDataSource.getRepository(User).findOneBy({ id: '1' }); // TO DO get real ID
    req.user = user;
    console.log(user);
    next();
}
