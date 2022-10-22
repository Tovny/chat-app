import { Request as ExpressRequest } from 'express';
import { WebSocket as WsWebsocket } from 'ws';
import { Message } from './entity/Message.model';
import { Room } from './entity/Room.model';
import { RoomUser } from './entity/RoomUser.model';
import { User } from './entity/User.model';

export interface Request extends ExpressRequest {
    user: User;
    foundUser?: User | null;
    foundRoom?: Room | null;
    roomUser?: RoomUser | null;
    message?: Message | null;
}

export interface Websocket extends WsWebsocket {
    rooms: RoomUser[];
    user: User;
}
