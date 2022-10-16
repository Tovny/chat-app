import { OPEN } from 'ws';
import { wss } from '..';
import { Websocket } from '../types';
import { arraysIntersect } from '../utils/arrays-intersect.util';

export const broadcastDisconnect = (ws: Websocket) => {
    const rooms = ws.rooms;
    if (!rooms.length) {
        return;
    }
    const userId = rooms[0]['userId'];
    let multipleConnections = false;
    wss.clients.forEach((client: Websocket) => {
        if (
            multipleConnections ||
            client === ws ||
            client.readyState !== OPEN ||
            !client.rooms.length
        ) {
            return;
        }
        multipleConnections = client.rooms[0]['userId'] === userId;
    });
    if (multipleConnections) {
        return;
    }
    wss.clients.forEach((client: Websocket) => {
        if (client === ws || client.readyState !== OPEN) {
            return;
        }
        const shareRooms = arraysIntersect(rooms, client.rooms, 'roomId');
        if (shareRooms) {
            return client.send(
                JSON.stringify({
                    type: 'disconnect',
                    user: userId,
                })
            );
        }
    });
};
