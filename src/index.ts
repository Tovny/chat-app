import 'reflect-metadata';
import express from 'express';
import { SqlDataSource } from './utils/db.util';
import { roomRouter } from './routes/room.routes';
import { json } from 'body-parser';
import { getUser } from './middleware/get-user.middleware';
import { errorHandler } from './middleware/handle-error.middleware';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { authRouter } from './routes/auth.routes';
import { decodeUserJwt } from './utils/decode-user-jwt.util';
import { Websocket } from './types';
import { broadcastDisconnect } from './ws-handlers/broadcast-disconnection.handler';
import { cors } from './middleware/cors.middleware';
import { User } from './entity/User.model';
import { connectSocket } from './ws-handlers/connection.handler';

const app = express();
export const wss = new WebSocketServer({ noServer: true });

app.use(json());
app.use(cors);

app.use(getUser);

app.use(authRouter);
app.use('/rooms', roomRouter);

app.use(errorHandler);

const server = createServer(app);

server.on('upgrade', async (req, socket, head) => {
    try {
        const jwt = req.url?.split('jwt=')[1];
        const token = decodeUserJwt(jwt, '');

        if (!token) {
            socket.write('HTTP/1.1 401 Unauthorized');
            return socket.destroy();
        }
        const user = await SqlDataSource.getRepository(User).findOneBy({
            id: `${token.id}`,
        });

        if (!user) {
            socket.write('HTTP/1.1 401 Unauthorized');
            return socket.destroy();
        }

        wss.handleUpgrade(req, socket, head, async (ws: Websocket) => {
            const { noPingTimeout, pingInterval } = await connectSocket(
                ws,
                user
            );
            const handleDisconnect = () => {
                clearInterval(pingInterval);
                broadcastDisconnect(ws);
                wss.clients.delete(ws);
            };

            ws.on('pong', () => {
                clearTimeout(noPingTimeout);
            });
            ws.on('error', () => handleDisconnect());
            ws.on('close', () => handleDisconnect());
        });
    } catch (err) {
        socket.write('HTTP/1.1 500 Server error');
        return socket.destroy();
    }
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
