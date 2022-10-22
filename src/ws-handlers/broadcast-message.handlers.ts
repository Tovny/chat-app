import { OPEN } from 'ws';
import { Websocket } from '../types';
import { wss } from '..';
import { Message } from '../entity/Message.model';

export function broadcastMessage(message: Message, roomId: string) {
    wss.clients.forEach((client: Websocket) => {
        if (client.readyState !== OPEN) {
            return;
        }
        if (client.rooms.some((r) => r.room.id === roomId)) {
            client.send(JSON.stringify({ type: 'message', payload: message }));
        }
    });
}

export function broadcastMessageUpdate(message: Message) {
    wss.clients.forEach((client: Websocket) => {
        if (client.readyState !== OPEN) {
            return;
        }
        if (client.rooms.some((r) => r.room.id === message.room.id)) {
            client.send(
                JSON.stringify({ type: 'messageEdit', payload: message })
            );
        }
    });
}

export function broadcastMessageDeletion(message: Message) {
    wss.clients.forEach((client: Websocket) => {
        if (client.readyState !== OPEN) {
            return;
        }
        if (client.rooms.some((r) => r.room.id === message.room.id)) {
            client.send(
                JSON.stringify({
                    type: 'messageDelete',
                    payload: message,
                })
            );
        }
    });
}
