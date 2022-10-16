import { hash } from 'bcrypt';
import { NextFunction, Response } from 'express';
import { OPEN } from 'ws';
import { wss } from '..';
import { Message } from '../entity/Message.model';
import { Room } from '../entity/Room.model';
import { RoomUser } from '../entity/RoomUser.model';
import { Request, Websocket } from '../types';
import { SqlDataSource } from '../utils/db.util';
import { handleError } from '../utils/handle-error.util';

const getSharedRoomQuery = () => {
    return SqlDataSource.getRepository(RoomUser)
        .createQueryBuilder('roomUser')
        .leftJoin('roomUser.user', 'user')
        .leftJoin('roomUser.room', 'room')
        .addSelect([
            'user.id',
            'user.username',
            'user.email',
            'room.id',
            'room.name',
        ]);
};

export const getUserRooms = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const rooms = await getSharedRoomQuery()
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
        const room = await SqlDataSource.getRepository(Room)
            .createQueryBuilder('room')
            .where('room.id = :roomID', { roomID: id })
            .addSelect(['room.id', 'room.name'])
            .leftJoinAndSelect('room.messages', 'message')
            .leftJoinAndSelect('room.users', 'roomUsers')
            .leftJoin('roomUsers.user', 'user')
            .addSelect(['user.username', 'user.id'])
            .getOne();

        const onlineUsers: RoomUser[] = [];
        wss.clients.forEach((client: Websocket) => {
            const clientRoom = client.rooms.find(
                (r) => (r.room.id as any) === Number(id) // TO DO
            );
            if (clientRoom) {
                onlineUsers.push(clientRoom);
            }
        });

        res.json({ room, onlineUsers });
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
        const room = await SqlDataSource.getRepository(Room).findOneBy({
            name: `${name}`,
        });
        const repo = SqlDataSource.getRepository(RoomUser);
        const newRoomUser = repo.create({ user: req.user, room: room });
        const response = await repo.save(newRoomUser);
        delete response.room.password;
        delete response.user.password;
        wss.clients.forEach((client: Websocket) => {
            if (client.readyState !== OPEN) {
                return;
            }
            if (client.rooms.some((r) => r['roomId'] === room['roomId'])) {
                client.send(
                    JSON.stringify({ type: 'newUser', message: response })
                );
            }
        });
        res.sendStatus(200);
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
            if (client.rooms.some((r) => r['roomId'] === room['roomId'])) {
                client.send(
                    JSON.stringify({ type: 'message', message: response })
                );
            }
        });
        res.sendStatus(200);
    } catch (err) {
        handleError(err, 500, next);
    }
};
