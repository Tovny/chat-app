import { OPEN } from 'ws';
import { RoomUser } from '../entity/RoomUser.model';
import { wss } from '..';
import { Websocket } from '../types';
import { Room } from '../entity/Room.model';
import { broadcastConnection } from './broadcast-connection.handler';

export function broadcastRoomCreation(roomUser: RoomUser) {
    wss.clients.forEach((client: Websocket) => {
        if (client.readyState === OPEN && client.user.id === roomUser.user.id) {
            client.rooms.push(roomUser);
            client.send(
                JSON.stringify({
                    type: 'joinedRoom',
                    payload: roomUser,
                })
            );
        }
    });
}

export function broadcastRoomJoin(roomUser: RoomUser, updatedRoom: Room) {
    let userSocket: Websocket;
    wss.clients.forEach((client: Websocket) => {
        if (client.user.id === roomUser.user.id) {
            client.rooms.push(roomUser);
            if (!userSocket) {
                userSocket = client;
            }
        }
        client.send(
            JSON.stringify({ type: 'roomUpdate', payload: updatedRoom })
        );
    });
    broadcastConnection(userSocket, roomUser);
}

export function broadcastRoomLeave(roomUser: RoomUser, updatedRoom: Room) {
    wss.clients.forEach((client: Websocket) => {
        if (client.user.id === roomUser.user.id) {
            client.rooms = client.rooms.filter(
                (room) => room.id !== roomUser.id
            );
            return client.send(
                JSON.stringify({ type: 'leftRoom', payload: roomUser })
            );
        }
        client.send(
            JSON.stringify({ type: 'roomUpdate', payload: updatedRoom })
        );
    });
}
