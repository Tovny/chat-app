import { compare } from 'bcrypt';
import { Meta } from 'express-validator';
import { getRoomUserUtil } from '../utils/get-room-user.util';
import { ResponseError } from '../utils/response-error.util';

export function isRoomMember(message: string) {
    return (_: string, { req }: Meta) => {
        if (!req.roomUser) {
            throw new ResponseError(message, 403);
        }

        return true;
    };
}

export async function isNotRoomMember(_: string, { req }: Meta) {
    const roomUser = await getRoomUserUtil({
        userId: req.user.id,
        roomId: req.foundRoom.id,
    });
    if (roomUser) {
        return Promise.reject({
            statusCode: 403,
            message: 'Already a member.',
        });
    }
}

export function doesRoomExist(_: string, { req }) {
    if (!req.foundRoom) {
        throw new ResponseError('Room with given name does not exist.', 403);
    }
    return true;
}

export function doesRoomNotExist(_: string, { req }) {
    if (req.foundRoom) {
        throw new ResponseError('Room with given name already exists.', 403);
    }
    return true;
}

export async function doesRoomPasswordMatch(password: string, { req }: Meta) {
    const passMatches = await compare(password, req.foundRoom.password);
    if (!passMatches) {
        return Promise.reject({
            statusCode: 403,
            message: 'Passwords do not match.',
        });
    }
}
