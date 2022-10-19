import { compare } from 'bcrypt';
import { Router } from 'express';
import { body, param } from 'express-validator';
import {
    deleteLeaveRoom,
    getRoom,
    getUserRooms,
    postCreateRoom,
    postJoinRoom,
} from '../controllers/room.controller';
import { Room } from '../entity/Room.model';
import { getRoomUser } from '../middleware/get-room-user.middleware';
import { requireAuth } from '../middleware/require-auth.middleware';
import { validateInput } from '../middleware/validate-input.middleware';
import { SqlDataSource } from '../utils/db.util';
import { getRoomUserUtil } from '../utils/get-room-user.util';
import { ResponseError } from '../utils/response-error.util';

export const roomRouter = Router();

roomRouter.get('/', requireAuth, getUserRooms);

roomRouter.get('/:id', requireAuth, getRoom);

roomRouter.post(
    '/create',
    requireAuth,
    validateInput([
        body('name')
            .isLength({ min: 4 })
            .custom(async (name) => {
                try {
                    const room = await SqlDataSource.getRepository(
                        Room
                    ).findOneBy({
                        name,
                    });
                    if (room) {
                        return Promise.reject({
                            statusCode: 403,
                            message: 'Room with given input already exits',
                        });
                    }
                } catch (err) {
                    return Promise.reject(err);
                }
            }),
        body('password').isLength({ min: 4 }).isAlphanumeric(),
    ]),
    postCreateRoom
);

roomRouter.post(
    '/join',
    requireAuth,
    validateInput([
        body('password').custom(async (password, { req }) => {
            try {
                const { name } = req.body;
                const room = await SqlDataSource.getRepository(Room).findOneBy({
                    name: `${name}`,
                });
                if (!room) {
                    return Promise.reject({
                        statusCode: 403,
                        message: 'Room does not exist.',
                    });
                }
                const passMatches = await compare(password, room.password);
                if (!passMatches) {
                    return Promise.reject({
                        statusCode: 403,
                        message: 'Passwords do not match.',
                    });
                }
                const roomUser = await getRoomUserUtil({
                    userId: req.user.id,
                    roomId: room.id,
                });
                if (roomUser) {
                    return Promise.reject({
                        statusCode: 403,
                        message: 'Already a member.',
                    });
                }
            } catch (err) {
                return Promise.reject(err);
            }
        }),
    ]),
    postJoinRoom
);

roomRouter.delete(
    '/leave/:roomUserId',
    requireAuth,
    getRoomUser,
    validateInput([
        param('roomUserId').custom(async (_, { req }) => {
            if (!req.roomUser) {
                throw new ResponseError(
                    'Not allowed to post in this room',
                    403
                );
            }
            return;
        }),
    ]),
    deleteLeaveRoom
);
