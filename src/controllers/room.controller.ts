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
            .createQueryBuilder('roomUser')
            .innerJoinAndSelect(User, 'user')
            .innerJoinAndSelect(Room, 'room')
            .where('user.id = :id', { id: req.user.id })
            .getMany();
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
            .createQueryBuilder('roomUser')
            .leftJoinAndSelect('roomUser.user', 'user')
            .leftJoinAndSelect('roomUser.room', 'room')
            .leftJoinAndSelect('room.messages', 'message')
            .where('room.id = :roomID', { roomID: id })
            .andWhere('user.id = :userID', { userID: req.user.id })
            .getOne();

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
        const hashedPass = await hash(
            password,
            Number(process.env.HASH_ROUNDS)
        );
        const repo = SqlDataSource.getRepository(Room);
        const newRoom = repo.create({ name, password: hashedPass });
        const response = await repo.save(newRoom);
        res.json(response);
    } catch (err) {
        handleError(err, 500, next);
    }
};

export const postJoinRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;

    try {
        const room = await SqlDataSource.getRepository(Room).findOneBy({
            id: id,
        });
        const repo = SqlDataSource.getRepository(RoomUser);
        const newRoomUser = repo.create({ user: req.user, room: room });
        const response = await repo.save(newRoomUser);
        res.json(response);
    } catch (err) {
        handleError(err, 500, next);
    }
};

export const postRoomMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { content } = req.body;
    const { id } = req.params;
    try {
        const repo = SqlDataSource.getRepository(Message);
        const room = await SqlDataSource.getRepository(Room).findOneBy({ id });
        const newMessage = repo.create({ content, user: req.user, room: room });
        const response = await repo.save(newMessage);
        res.json(response);
    } catch (err) {
        handleError(err, 500, next);
    }
};
