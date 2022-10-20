import { NextFunction, Response } from 'express';
import { OPEN } from 'ws';
import { Message } from '../entity/Message.model';
import { Room } from '../entity/Room.model';
import { Request, Websocket } from '../types';
import { SqlDataSource } from '../utils/db.util';
import { wss } from '..';
import { ResponseError } from '../utils/response-error.util';

export const postRoomMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { content } = req.body;
    const { roomId } = req.params;
    try {
        const repo = SqlDataSource.getRepository(Message);
        const room = await SqlDataSource.getRepository(Room).findOneBy({
            id: roomId,
        });
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
        next(new ResponseError(err.message, 500));
    }
};

export const putRoomMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { content } = req.body;
    try {
        const message = { ...req.message, content };
        const response = await SqlDataSource.getRepository(Message).save(
            message
        );
        wss.clients.forEach((client: Websocket) => {
            if (client.readyState !== OPEN) {
                return;
            }
            if (client.rooms.some((r) => r.room.id === message.room.id)) {
                client.send(
                    JSON.stringify({ type: 'messageEdit', payload: response })
                );
            }
        });
        res.status(200);
    } catch (err) {
        next(new ResponseError(err.message, 500));
    }
};

export const deleteRoomMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const response = await SqlDataSource.getRepository(Message).delete(
            req.message.id
        );
        console.log(response);
        if (response.affected) {
            wss.clients.forEach((client: Websocket) => {
                if (client.readyState !== OPEN) {
                    return;
                }
                if (
                    client.rooms.some((r) => r.room.id === req.message.room.id)
                ) {
                    client.send(
                        JSON.stringify({
                            type: 'messageDelete',
                            payload: req.message,
                        })
                    );
                }
            });
            return res.status(200);
        }
        res.status(500).send('Could not delete message.');
    } catch (err) {
        next(new ResponseError(err.message, 500));
    }
};
