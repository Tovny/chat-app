import { Router } from 'express';
import { body } from 'express-validator';
import {
    getRoom,
    getUserRooms,
    postCreateRoom,
} from '../controllers/room.controller';
import { Room } from '../entity/Room.model';
import { requireAuth } from '../middleware/require-auth.middleware';
import { validateInput } from '../middleware/validate-input.middleware';
import { SqlDataSource } from '../utils/db.util';

export const roomRouter = Router();

roomRouter.get('/', requireAuth, getUserRooms);
roomRouter.get('/:id', requireAuth, getRoom);
roomRouter.post(
    '/',
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
                    Promise.reject(err);
                }
            }),
        body('password').isLength({ min: 4 }).isAlphanumeric(),
    ]),
    postCreateRoom
);
