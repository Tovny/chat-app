import { OPEN } from 'ws';
import { wss } from '..';
import { RoomUser } from '../entity/RoomUser.model';
import { Websocket } from '../types';
import { arrayIntersection } from '../utils/array-intersection';

export const broadcastConnection = (ws: Websocket, room?: RoomUser) => {
    if (!ws.rooms.length && !room) {
        return;
    }
    const onlineUsers = [ws.user];
    wss.clients.forEach((client: Websocket) => {
        if (client === ws || client.readyState !== OPEN) {
            return;
        }

        let sharedRoom: RoomUser | string | undefined;
        if (room) {
            sharedRoom = client.rooms
                .map((r) => r.room.id)
                .find((id) => id === room.room.id);
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
