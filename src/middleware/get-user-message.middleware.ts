import { NextFunction, Response } from 'express';
import { Message } from '../entity/Message.model';
import { Request } from '../types';
import { SqlDataSource } from '../config/db.config';

export async function getUserMessage(
    req: Request,
    _: Response,
    next: NextFunction
) {
    const { id } = req.params;
    const message = await SqlDataSource.getRepository(Message)
        .createQueryBuilder('message')
        .where('message.id = :id', { id })
        .andWhere('message.user.id = :userId', { userId: req.user.id })
        .leftJoin('message.user', 'user')
        .addSelect(['user.id', 'user.username'])
        .leftJoin('message.room', 'room')
        .addSelect(['room.id', 'room.name'])
        .getOne();
    req.message = message;
    next();
}
