import { Router } from 'express';
import { requireAuth } from '../middleware/require-auth.middleware';
import { validateInput } from '../middleware/validate-input.middleware';
import { body, param, query } from 'express-validator';
import {
    deleteRoomMessage,
    getRoomMessages,
    postRoomMessage,
    putRoomMessage,
} from '../controllers/message.controller';
import { getRoomUser } from '../middleware/get-room-user.middleware';
import { getUserMessage } from '../middleware/get-user-message.middleware';
import { isRoomMember } from '../validators/room.validators';
import {
    doesUserMessageExist,
    isValidMessageUpdate,
} from '../validators/message.validators';

export const messageRouter = Router();

messageRouter.get(
    '/:id',
    requireAuth,
    getRoomUser,
    validateInput([
        query('skip').isInt().withMessage('wrong skip parameter.'),
        query('take')
            .isInt()
            .withMessage('wrong take parameter.')
            .custom(isRoomMember('Not a room member.')),
    ]),
    getRoomMessages
);

messageRouter.post(
    '/:roomId',
    requireAuth,
    getRoomUser,
    validateInput([
        body('content')
            .isLength({ min: 1 })
            .withMessage('needs to be at least one character long.')
            .custom(isRoomMember('Not allowed to post in this room')),
    ]),
    postRoomMessage
);

messageRouter.put(
    '/:id',
    requireAuth,
    getUserMessage,
    validateInput([
        body('content')
            .isLength({ min: 1 })
            .withMessage('content needs to be at least one character long.')

            .custom(doesUserMessageExist)
            .custom(isValidMessageUpdate),
    ]),
    putRoomMessage
);

messageRouter.delete(
    '/:id',
    requireAuth,
    getUserMessage,
    validateInput([param('id').custom(doesUserMessageExist)]),
    deleteRoomMessage
);
