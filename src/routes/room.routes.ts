import { Router } from 'express';
import { body, param } from 'express-validator';
import {
    deleteLeaveRoom,
    getRoom,
    getUserRooms,
    postCreateRoom,
    postJoinRoom,
} from '../controllers/room.controller';
import { getRoomUser } from '../middleware/get-room-user.middleware';
import { requireAuth } from '../middleware/require-auth.middleware';
import { validateInput } from '../middleware/validate-input.middleware';
import { getRoomByName } from '../middleware/get-room.middleware';
import {
    doesRoomExist,
    doesRoomNotExist,
    doesRoomPasswordMatch,
    isNotRoomMember,
    isRoomMember,
} from '../validators/room.validators';

export const roomRouter = Router();

roomRouter.get('/', requireAuth, getUserRooms);

roomRouter.get('/:id', requireAuth, getRoom);

roomRouter.post(
    '/create',
    requireAuth,
    getRoomByName,
    validateInput([
        body('name').isLength({ min: 4 }).custom(doesRoomNotExist),
        body('password').isLength({ min: 4 }).isAlphanumeric(),
    ]),
    postCreateRoom
);

roomRouter.post(
    '/join',
    requireAuth,
    getRoomByName,
    validateInput([
        body('password')
            .custom(doesRoomExist)
            .custom(doesRoomPasswordMatch)
            .custom(isNotRoomMember),
    ]),
    postJoinRoom
);

roomRouter.delete(
    '/leave/:roomUserId',
    requireAuth,
    getRoomUser,
    validateInput([
        param('roomUserId').custom(
            isRoomMember('Only members can leave rooms.')
        ),
    ]),
    deleteLeaveRoom
);
