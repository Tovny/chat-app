import { OPEN } from 'ws';
import { wss } from '..';
import { Websocket } from '../types';
import { arraysIntersect } from '../utils/arrays-intersect.util';

export const broadcastConnection = (ws: Websocket) => {
    const rooms = ws.rooms;
    if (!rooms.length) {
        return;
    }
    const user = rooms[0].user;
    wss.clients.forEach((client: Websocket) => {
        if (client === ws || client.readyState !== OPEN) {
            return;
        }
        const shareRooms = arraysIntersect(rooms, client.rooms, 'roomId');

        if (shareRooms) {
            client.send({
                type: 'connection',
                user,
            });
        }
    });
};
