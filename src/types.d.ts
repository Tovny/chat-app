import { Request as ExpressRequest } from 'express';
import { WebSocket as WsWebsocket } from 'ws';
import { Message } from './entity/Message.model';
import { RoomUser } from './entity/RoomUser.model';
import { User } from './entity/User.model';

export interface Request extends ExpressRequest {
    user: User;
    roomUser?: RoomUser | null;
    message?: Message | null;
}

export interface Websocket extends WsWebsocket {
    rooms: RoomUser[];
    user: User;
}
