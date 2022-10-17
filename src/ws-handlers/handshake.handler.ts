import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { wss } from '..';
import { User } from '../entity/User.model';
import { SqlDataSource } from '../utils/db.util';
import { decodeUserJwt } from '../utils/decode-user-jwt.util';

export const handshake = async (
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer
) => {
    try {
        const jwt = req.url?.split('jwt=')[1];
        const token = decodeUserJwt(jwt, '');

        if (!token) {
            socket.write('HTTP/1.1 401 Unauthorized');
            return socket.destroy();
        }
        const user = await SqlDataSource.getRepository(User)
            .createQueryBuilder('user')
            .select(['user.id', 'user.username', 'user.email'])
            .where('user.id = :id', { id: token.id })
            .getOne();

        if (!user) {
            socket.write('HTTP/1.1 401 Unauthorized');
            return socket.destroy();
        }

        wss.handleUpgrade(req, socket, head, async (ws) => {
            wss.emit('connection', ws, req, user);
        });
    } catch (err) {
        socket.write('HTTP/1.1 500 Server error');
        return socket.destroy();
    }
};
