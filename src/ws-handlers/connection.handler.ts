import { wss } from '..';
import { RoomUser } from '../entity/RoomUser.model';
import { User } from '../entity/User.model';
import { Websocket } from '../types';
import { SqlDataSource } from '../utils/db.util';
import { broadcastDisconnect } from './broadcast-disconnection.handler';
import { broadcastConnection } from './broadcast-connection.handler';

export const connectSocket = async (ws: Websocket, user: User) => {
    const rooms = await SqlDataSource.getRepository(RoomUser)
        .createQueryBuilder('roomUser')
        .leftJoin('roomUser.user', 'user')
        .leftJoin('roomUser.room', 'room')
        .addSelect(['user.id', 'user.username', 'room.id', 'room.name'])
        .where('user.id = :id', { id: user.id })
        .getMany();
    ws.rooms = rooms;
    broadcastConnection(ws);

    let noPingTimeout: NodeJS.Timeout;
    const pingInterval = setInterval(() => {
        ws.ping();
        noPingTimeout = setTimeout(() => {
            ws.terminate();
        }, 1000 * 60);
    }, 1000);

    const handleDisconnect = () => {
        clearInterval(pingInterval);
        broadcastDisconnect(ws);
        wss.clients.delete(ws);
    };
    ws.on('pong', () => {
        clearTimeout(noPingTimeout);
    });
    ws.on('error', () => handleDisconnect());
    ws.on('close', () => handleDisconnect());
};
