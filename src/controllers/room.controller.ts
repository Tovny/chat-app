import { hash } from 'bcrypt';
import { NextFunction, Response } from 'express';
import { OPEN } from 'ws';
import { wss } from '..';
import { Message } from '../entity/Message.model';
import { Room } from '../entity/Room.model';
import { RoomUser } from '../entity/RoomUser.model';
import { Request, Websocket } from '../types';
import { SqlDataSource } from '../utils/db.util';
import { handleRequestError } from '../utils/handle-request-error.util';
import { broadcastConnection } from '../ws-handlers/broadcast-connection.handler';
import { getRoom as roomQuery } from '../utils/get-room.util';

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
        handleRequestError(err, 500, next);
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
        handleRequestError(err, 500, next);
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
        wss.clients.forEach((client: Websocket) => {
            if (client.readyState === OPEN && client.user.id === req.user.id) {
                client.rooms.push(roomUserResponse);
                client.send(
                    JSON.stringify({
                        type: 'joinedRoom',
                        payload: roomUserResponse,
                    })
                );
            }
        });
        res.sendStatus(200);
    } catch (err) {
        handleRequestError(err, 500, next);
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
            .where('room.name = :name', { name })
            .getOne();
        const repo = SqlDataSource.getRepository(RoomUser);
        const newRoomUser = repo.create({ user: req.user, room: room });
        const roomUser = await repo.save(newRoomUser);
        let userSocket: Websocket;
        const updatedRoom = await roomQuery(room.id);
        wss.clients.forEach((client: Websocket) => {
            if (client.user.id === req.user.id) {
                client.rooms.push(roomUser);
                if (!userSocket) {
                    userSocket = client;
                }
            }
            client.send(
                JSON.stringify({ type: 'roomUpdate', payload: updatedRoom })
            );
        });
        broadcastConnection(userSocket, roomUser);
        res.json(roomUser);
    } catch (err) {
        handleRequestError(err, 500, next);
    }
};

export const deleteLeaveRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    try {
        const roomUser = await SqlDataSource.getRepository(RoomUser)
            .createQueryBuilder('roomUser')
            .where('roomUser.id = :id', { id })
            .leftJoin('roomUser.room', 'room')
            .addSelect('room.id')
            .getOne();
        const { affected } = await SqlDataSource.getRepository(RoomUser).delete(
            id
        );
        if (!affected) {
            return handleRequestError(
                new Error('Could not leave room.'),
                500,
                next
            );
        }
        const updatedRoom = await roomQuery(roomUser.room.id);
        wss.clients.forEach((client: Websocket) => {
            if (client.user.id === req.user.id) {
                client.rooms = client.rooms.filter(
                    (room) => room.id !== roomUser.id
                );
                return client.send(
                    JSON.stringify({ type: 'leftRoom', payload: roomUser })
                );
            }
            client.send(
                JSON.stringify({ type: 'roomUpdate', payload: updatedRoom })
            );
        });
        res.sendStatus(200);
    } catch (err) {
        handleRequestError(err, 500, next);
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
        handleRequestError(err, 500, next);
    }
};
