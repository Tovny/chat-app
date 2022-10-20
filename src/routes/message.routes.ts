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
import { ResponseError } from '../utils/response-error.util';
import { getUserMessage } from '../middleware/get-user-message.middleware';

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
            .custom((_, { req }) => {
                if (!req.roomUser) {
                    throw new ResponseError(
                        'Not allowed to post in this room',
                        403
                    );
                }

                return true;
            }),
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
            .custom((_, { req }) => {
                if (!req.roomUser) {
                    throw new ResponseError(
                        'Not allowed to post in this room',
                        403
                    );
                }
                return true;
            }),
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
            .custom((content, { req }) => {
                if (!req.message) {
                    throw new ResponseError('Message not found.', 404);
                }
                if (req.message.content === content) {
                    throw new ResponseError(
                        'Can not use the same message.',
                        403
                    );
                }
                return true;
            }),
    ]),
    putRoomMessage
);

messageRouter.delete(
    '/:id',
    requireAuth,
    getUserMessage,
    validateInput([
        param('id').custom((_, { req }) => {
            if (!req.message) {
                throw new ResponseError('Message not found.', 404);
            }

            return true;
        }),
    ]),
    deleteRoomMessage
);
