import { Websocket } from '../types';
import { broadcastUserConnection } from '../utils/broadcast-user-connection.util';

export const broadcastConnection = (ws: Websocket) => {
    if (!ws.rooms.length) {
        return;
    }
    broadcastUserConnection(ws);
};
