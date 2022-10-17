import { hash } from 'bcrypt';
import { NextFunction, Response } from 'express';
import { OPEN } from 'ws';
import { wss } from '..';
import { Message } from '../entity/Message.model';
import { Room } from '../entity/Room.model';
import { RoomUser } from '../entity/RoomUser.model';
import { Request, Websocket } from '../types';
import { broadcastUserConnection } from '../utils/broadcast-user-connection.util';
import { SqlDataSource } from '../utils/db.util';
import { handleError } from '../utils/handle-error.util';

const roomQuery = async (id: string) => {
    return await SqlDataSource.getRepository(Room)
        .createQueryBuilder('room')
        .select(['room.id', 'room.name'])
        .where('room.id = :roomID', { roomID: id })
        .leftJoinAndSelect('room.messages', 'message')
        .leftJoinAndSelect('room.users', 'roomUsers')
        .leftJoin('roomUsers.user', 'user')
        .addSelect(['user.username', 'user.id'])
        .getOne();
};

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
        const room = await roomQuery(id);
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
        res.json(roomUserResponse);
    } catch (err) {
        handleError(err, 500, next);
    }
};

export const postJoinRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { name } = req.body;

    try {
        const room = await SqlDataSource.getRepository(Room)
            .createQueryBuilder('room')
            .select(['room.id', 'room.name'])
            .where('room.name = :name', { name }) // room joiner ne dobi online userjev
            .getOne();
        const repo = SqlDataSource.getRepository(RoomUser);
        const newRoomUser = repo.create({ user: req.user, room: room });
        const roomUser = await repo.save(newRoomUser);
        let userSockets: Websocket[] = [];
        const updatedRoom = await roomQuery(room.id);
        wss.clients.forEach((client: Websocket) => {
            if (client.user.id === req.user.id) {
                client.rooms.push(roomUser);
                userSockets.push(client);
            }
            client.send(
                JSON.stringify({ type: 'roomUpdate', payload: updatedRoom })
            );
        });
        userSockets.forEach((socket) => {
            broadcastUserConnection(socket, room);
        });
        res.json(roomUser);
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
        wss.clients.forEach((client: Websocket) => {
            if (client.readyState !== OPEN) {
                return;
            }
            if (client.rooms.some((r) => r.room.id === room.id)) {
                client.send(
                    JSON.stringify({ type: 'message', payload: response })
                );
            }
        });
        res.sendStatus(200);
    } catch (err) {
        handleError(err, 500, next);
    }
};
