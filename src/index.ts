import 'reflect-metadata';
import express from 'express';
import { SqlDataSource } from './config/db.config';
import { roomRouter } from './routes/room.routes';
import { authRouter } from './routes/auth.routes';
import { messageRouter } from './routes/message.routes';
import { json } from 'body-parser';
import { getUser } from './middleware/get-user.middlewares';
import { errorHandler } from './middleware/handle-error.middleware';
import { createServer, IncomingMessage } from 'http';
import { WebSocketServer } from 'ws';
import { Websocket } from './types';
import { cors } from './middleware/cors.middleware';
import { User } from './entity/User.model';
import { handshake } from './ws-handlers/handshake.handler';
import { connectSocket } from './ws-handlers/connection.handler';

const app = express();
const server = createServer(app);
export const wss = new WebSocketServer({ noServer: true });

app.use(json());

app.use(cors);
app.use(getUser);

app.use(authRouter);
app.use('/rooms', roomRouter);
app.use('/messages', messageRouter);

app.use(errorHandler);

server.on('upgrade', async (req, socket, head) => {
    handshake(req, socket, head);
});

wss.on('connection', async (ws: Websocket, _: IncomingMessage, user: User) => {
    await connectSocket(ws, user);
});

const port = process.env.PORT || 5000;
server.listen(port, async () => {
    try {
        await SqlDataSource.initialize();
        console.log(`Server running on port ${port}`);
    } catch (err) {
        console.error(err);
    }
});
