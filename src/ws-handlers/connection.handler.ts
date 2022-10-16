import { RoomUser } from '../entity/RoomUser.model';
import { User } from '../entity/User.model';
import { Websocket } from '../types';
import { SqlDataSource } from '../utils/db.util';

export const connectSocket = async (ws: Websocket, user: User) => {
    const rooms = await SqlDataSource.getRepository(RoomUser)
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.user', 'user')
        .where('user.id = :id', { id: user.id })
        .execute();
    ws.rooms = rooms;

    let noPingTimeout: NodeJS.Timeout;
    const pingInterval = setInterval(() => {
        ws.ping();
        noPingTimeout = setTimeout(() => {
            ws.terminate();
        }, 1000 * 60);
    }, 1000);

    return { noPingTimeout, pingInterval };
};
