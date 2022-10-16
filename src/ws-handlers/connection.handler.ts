import { IncomingMessage } from 'http';
import { RoomUser } from '../entity/RoomUser.model';
import { User } from '../entity/User.model';
import { Websocket } from '../types';
import { SqlDataSource } from '../utils/db.util';

export const connectSocket = async (
    ws: Websocket,
    req: IncomingMessage,
    user: User
) => {
    const rooms = await SqlDataSource.getRepository(RoomUser)
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.user', 'user')
        .where('user.id = :id', { id: user.id })
        .execute();
    ws.rooms = rooms;
    ws.emit('connection', ws, req);

    let noPingTimeout: NodeJS.Timeout;
    const pingInterval = setInterval(() => {
        ws.ping();
        noPingTimeout = setTimeout(() => {
            ws.terminate();
        }, 1000 * 60);
    }, 1000);

    return { noPingTimeout, pingInterval };
};
