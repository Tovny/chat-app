import { hash } from 'bcrypt';
import { NextFunction, Response } from 'express';
import { Message } from '../entity/Message.model';
import { Room } from '../entity/Room.model';
import { RoomUser } from '../entity/RoomUser.model';
import { User } from '../entity/User.model';
import { Request } from '../types';
import { SqlDataSource } from '../utils/db.util';
import { handleError } from '../utils/handle-error.util';

export const getUserRooms = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const rooms = await SqlDataSource.getRepository(RoomUser)
            .createQueryBuilder('data')
            .innerJoinAndSelect(User, 'user')
            .innerJoinAndSelect(Room, 'room')
            .where('user.id = :id', { id: req.user.id })
            .execute();
        res.json(rooms);
    } catch (err) {
        handleError(err, 500, next);
    }
};

export const getRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    try {
        const room = await SqlDataSource.getRepository(RoomUser)
            .createQueryBuilder('data')
            .innerJoinAndSelect(User, 'user')
            .innerJoinAndSelect(Room, 'room')
            .innerJoinAndSelect(Message, 'message')
            .where('room.id = :roomID', { roomID: id })
            .andWhere('user.id = :userID', { userID: req.user.id })
            .execute();
        res.json(room);
    } catch (err) {
        handleError(err, 500, next);
    }
};

export const postCreateRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { name, password } = req.body;
    try {
        const hashedPass = await hash(password, 10);
        const repo = SqlDataSource.getRepository(Room);
        const newRoom = repo.create({ name, password: hashedPass });
        const response = await repo.save(newRoom);
        res.json(response);
    } catch (err) {
        handleError(err, 500, next);
    }
};
