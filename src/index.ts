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
import { User } from './entity/User.model';
import { Connection } from './entity/Connection.model';

const app = express();
export const wss = new WebSocketServer({ noServer: true });

app.use(json());

app.use(getUser);

app.use(authRouter);
app.use('/rooms', roomRouter);

app.use(errorHandler);

const server = createServer(app);

server.on('upgrade', async (req, socket, head) => {
    const token = decodeUserJwt(req.headers.authorization);
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

    wss.handleUpgrade(req, socket, head, (ws) => {
        ws.emit('connection', ws, user);
    });
});

wss.on('connection', async (ws, user: User) => {
    const connectionRepo = SqlDataSource.getRepository(Connection);
    const newConnection = connectionRepo.create({ user });
    const savedConnection = await connectionRepo.save(newConnection);

    ws.on('error', () => {
        connectionRepo.delete(savedConnection);
    });

    ws.on('close', () => {
        connectionRepo.delete(savedConnection);
    });
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
