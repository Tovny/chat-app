import { Meta } from 'express-validator';
import { ResponseError } from '../utils/response-error.util';

export function doesUserMessageExist(_: string, { req }: Meta) {
    if (!req.message) {
        throw new ResponseError('Message from current user not found.', 404);
    }
    return true;
}

export function isValidMessageUpdate(content: string, { req }: Meta) {
    if (req.message.content === content) {
        throw new ResponseError('Can not use the same message.', 403);
    }
    return true;
}
