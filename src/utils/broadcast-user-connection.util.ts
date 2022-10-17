import { OPEN } from 'ws';
import { wss } from '..';
import { Room } from '../entity/Room.model';
import { RoomUser } from '../entity/RoomUser.model';
import { Websocket } from '../types';
import { arrayIntersection } from './array-intersection';

export const broadcastUserConnection = (ws: Websocket, room?: Room) => {
    const onlineUsers = [ws.user];
    wss.clients.forEach((client: Websocket) => {
        if (client === ws || client.readyState !== OPEN) {
            return;
        }

        let sharedRoom: RoomUser | string | undefined;
        if (room) {
            sharedRoom = client.rooms
                .map((r) => r.room.id)
                .find((id) => id === room.id);
        } else {
            sharedRoom = arrayIntersection(ws.rooms, client.rooms, [
                'room',
                'id',
            ]);
        }

        if (sharedRoom) {
            onlineUsers.push(client.user);
            client.send(
                JSON.stringify({
                    type: 'connection',
                    payload: ws.user,
                })
            );
        }
    });
    ws.send(
        JSON.stringify({
            type: 'onlineUsers',
            payload: onlineUsers,
        })
    );
};
