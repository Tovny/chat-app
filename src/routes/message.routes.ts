import { Router } from 'express';
import { requireAuth } from '../middleware/require-auth.middleware';
import { validateInput } from '../middleware/validate-input.middleware';
import { body } from 'express-validator';
import { postRoomMessage } from '../controllers/message.controller';
import { getRoomUser } from '../middleware/get-room-user.middleware';
import { ResponseError } from '../utils/response-error.util';

export const messageRouter = Router();

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

messageRouter.put('/:id', requireAuth, validateInput([]));
