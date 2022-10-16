import { OPEN } from 'ws';
import { wss } from '..';
import { Websocket } from '../types';
import { arraysIntersect } from '../utils/arrays-intersect.util';

export const broadcastConnection = (ws: Websocket) => {
    const rooms = ws.rooms;
    wss.clients.forEach((client: Websocket) => {
        if (client === ws || client.readyState !== OPEN) {
            return;
        }
        const sharesRooms = arraysIntersect(
            rooms.map((r) => r.room),
            client.rooms.map((r) => r.room),
            'id'
        );

        if (sharesRooms) {
            client.send({
                type: 'connection',
                user: client.rooms[0].user,
            });
        }
    });
};
