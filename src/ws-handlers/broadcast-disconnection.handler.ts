import { OPEN } from 'ws';
import { wss } from '..';
import { Websocket } from '../types';
import { arraysIntersect } from '../utils/arrays-intersect.util';

export const broadcastDisconnection = (ws: Websocket) => {
    const rooms = ws.rooms;
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
        if (client.rooms[0].user.id === user.id) {
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
        const sharesRooms = arraysIntersect(rooms, client.rooms, [
            'room',
            'id',
        ]);
        if (sharesRooms) {
            return client.send({
                type: 'disconnection',
                user: client.rooms[0].user,
            });
        }
    });
};
