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
