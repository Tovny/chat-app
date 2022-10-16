import { OPEN } from 'ws';
import { wss } from '..';
import { Websocket } from '../types';
import { arraysIntersect } from '../utils/arrays-intersect.util';

export const broadcastDisconnect = (ws: Websocket) => {
    const rooms = ws.rooms;
    if (!rooms.length) {
        return;
    }
    const user = ws.rooms[0].user;
    let multipleConnections = false;
    wss.clients.forEach((client: Websocket) => {
        if (
            multipleConnections ||
            client === ws ||
            client.readyState !== OPEN
        ) {
            return;
        }
        if (client.rooms[0]?.user.id === user.id) {
            multipleConnections = true;
        }
    });
    if (multipleConnections) {
        return;
    }
    wss.clients.forEach((client: Websocket) => {
        if (client === ws || client.readyState !== OPEN) {
            return;
        }
        const shareRooms = arraysIntersect(rooms, client.rooms, ['room', 'id']);
        if (shareRooms) {
            return client.send({
                type: 'disconnect',
                user,
            });
        }
    });
};
