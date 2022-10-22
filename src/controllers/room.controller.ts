import { hash } from 'bcrypt';
import { NextFunction, Response } from 'express';
import { Room } from '../entity/Room.model';
import { RoomUser } from '../entity/RoomUser.model';
import { Request } from '../types';
import { SqlDataSource } from '../utils/db.util';
import { getRoom as roomQuery } from '../utils/get-room.util';
import { ResponseError } from '../utils/response-error.util';
import {
    broadcastRoomCreation,
    broadcastRoomJoin,
    broadcastRoomLeave,
} from '../ws-handlers/broadcast-room.handlers';

export const getUserRooms = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const rooms = await SqlDataSource.getRepository(RoomUser)
            .createQueryBuilder('roomUser')
            .leftJoin('roomUser.user', 'user')
            .leftJoin('roomUser.room', 'room')
            .addSelect([
                'user.id',
                'user.username',
                'user.email',
                'room.id',
                'room.name',
            ])
            .where('user.id = :id', { id: req.user.id })
            .getMany();
        res.json(rooms);
    } catch (err) {
        next(new ResponseError(err.message, 500));
    }
};

export const getRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    try {
        const room = await roomQuery(id);
        res.json(room);
    } catch (err) {
        next(new ResponseError(err.message, 500));
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
        const roomRepo = SqlDataSource.getRepository(Room);
        const userRepo = SqlDataSource.getRepository(RoomUser);
        const newRoom = roomRepo.create({ name, password: hashedPass });
        const roomResponse = await roomRepo.save(newRoom);
        const newRoomUser = userRepo.create({
            user: req.user,
            room: roomResponse,
        });
        const roomUserResponse = await userRepo.save(newRoomUser);
        delete roomUserResponse.room.password;
        delete roomUserResponse.user.password;
        broadcastRoomCreation(roomUserResponse);
        res.sendStatus(200);
    } catch (err) {
        next(new ResponseError(err.message, 500));
    }
};

export const postJoinRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        delete req.foundRoom.password;
        const repo = SqlDataSource.getRepository(RoomUser);
        const newRoomUser = repo.create({
            user: req.user,
            room: req.foundRoom,
        });
        const roomUser = await repo.save(newRoomUser);
        const updatedRoom = await roomQuery(req.foundRoom.id);
        broadcastRoomJoin(roomUser, updatedRoom);
        res.json(roomUser);
    } catch (err) {
        next(new ResponseError(err.message, 500));
    }
};

export const deleteLeaveRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { affected } = await SqlDataSource.getRepository(RoomUser).delete(
            req.roomUser.id
        );
        if (!affected) {
            throw new ResponseError('Could not leave room.', 500);
        }
        const updatedRoom = await roomQuery(req.roomUser.room.id);
        broadcastRoomLeave(req.roomUser, updatedRoom);
        res.sendStatus(200);
    } catch (err) {
        next(new ResponseError(err.message, 500));
    }
};
