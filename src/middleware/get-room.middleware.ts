import { NextFunction, Response } from 'express';
import { Request } from '../types';
import { SqlDataSource } from '../config/db.config';
import { Room } from '../entity/Room.model';

export async function getRoomByName(
    req: Request,
    _: Response,
    next: NextFunction
) {
    const { name } = req.body;
    const room = await SqlDataSource.getRepository(Room)
        .createQueryBuilder('room')
        .select(['room.id', 'room.name', 'room.password'])
        .where('room.name = :name', { name })
        .getOne();
    req.foundRoom = room;
    next();
}
