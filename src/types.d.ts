import { Request as ExpressRequest } from 'express';
import { WebSocket as WsWebsocket } from 'ws';
import { RoomUser } from './entity/RoomUser.model';
import { User } from './entity/User.model';

export interface Request extends ExpressRequest {
    user: User;
    error: ResponseError;
}

export interface ResponseError extends Partial<Error> {
    statusCode: number;
}

export interface Websocket extends WsWebsocket {
    rooms: RoomUser[];
    user: User;
}
