import { compare } from 'bcrypt';
import { Router } from 'express';
import { body } from 'express-validator';
import {
    getRoom,
    getUserRooms,
    postCreateRoom,
    postJoinRoom,
    postRoomMessage,
} from '../controllers/room.controller';
import { Room } from '../entity/Room.model';
import { requireAuth } from '../middleware/require-auth.middleware';
import { validateInput } from '../middleware/validate-input.middleware';
import { SqlDataSource } from '../utils/db.util';
import { getRoomUser } from '../utils/get-room-user.util';

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
                            msg: 'Room with given input already exits',
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
                        msg: 'Room does not exist.',
                    });
                }
                const passMatches = await compare(password, room.password);
                if (!passMatches) {
                    return Promise.reject({
                        statusCode: 403,
                        msg: 'Passwords do not match.',
                    });
                }
                const roomUser = await getRoomUser(req.user.id, room.id);
                if (roomUser) {
                    return Promise.reject({
                        statusCode: 402,
                        msg: 'Already a member of the room.',
                    });
                }
            } catch (err) {
                return Promise.reject(err);
            }
        }),
    ]),
    postJoinRoom
);

roomRouter.post(
    '/message/:id',
    requireAuth,
    validateInput([
        body('content')
            .isLength({ min: 5 })
            .custom(async (_, { req }) => {
                try {
                    const { id } = req.params;
                    const roomUser = await getRoomUser(req.user.id, id);

                    if (!roomUser) {
                        return Promise.reject({
                            statusCode: 401,
                            msg: 'You do not have permission to post in this room.',
                        });
                    }
                } catch (err) {
                    return Promise.reject(err);
                }
            }),
    ]),
    postRoomMessage
);
