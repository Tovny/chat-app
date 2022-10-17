import { wss } from '..';
import { RoomUser } from '../entity/RoomUser.model';
import { User } from '../entity/User.model';
import { Websocket } from '../types';
import { SqlDataSource } from '../utils/db.util';
import { broadcastDisconnect } from './broadcast-disconnection.handler';
import { broadcastConnection } from './broadcast-connection.handler';

export const connectSocket = async (ws: Websocket, user: User) => {
    ws.user = user;
    const rooms = await SqlDataSource.getRepository(RoomUser)
        .createQueryBuilder('roomUser')
        .where('roomUser.user= :user', { user: user.id })
        .leftJoin('roomUser.user', 'user')
        .leftJoin('roomUser.room', 'room')
        .addSelect(['user.id', 'user.username', 'room.id', 'room.name'])
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
