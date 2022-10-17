import { OPEN } from 'ws';
import { wss } from '..';
import { Websocket } from '../types';
import { arrayIntersection } from '../utils/array-intersection';

export const broadcastDisconnect = (ws: Websocket) => {
    if (!ws.rooms.length) {
        return;
    }
    let multipleConnections = false;
    wss.clients.forEach((client: Websocket) => {
        if (
            multipleConnections ||
            client === ws ||
            client.readyState !== OPEN
        ) {
            return;
        }
        multipleConnections = client.user.id === ws.user.id;
    });
    if (multipleConnections) {
        return;
    }
    wss.clients.forEach((client: Websocket) => {
        if (client === ws || client.readyState !== OPEN) {
            return;
        }
        const shareRooms = arrayIntersection(ws.rooms, client.rooms, [
            'room',
            'id',
        ]);
        if (shareRooms) {
            return client.send(
                JSON.stringify({
                    type: 'disconnect',
                    payload: ws.user,
                })
            );
        }
    });
};
