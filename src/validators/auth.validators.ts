import { Meta } from 'express-validator';
import { compare } from 'bcrypt';

export async function isValidUserData(password: string, { req }: Meta) {
    if (!req.foundUser) {
        return Promise.reject({
            statusCode: 400,
            message: 'User with username does not exist.',
        });
    }
    const passMatches = await compare(password, req.foundUser.password);
    if (!passMatches) {
        return Promise.reject({
            statusCode: 401,
            message: 'Password does not match.',
        });
    }
}

export function isValidPostUserData(username: string, { req }) {
    if (req.foundUser) {
        if (req.foundUser.username === username) {
            return Promise.reject({
                statusCode: 403,
                message: 'Username taken.',
            });
        }
        return Promise.reject({
            statusCode: 403,
            message: 'User with email already exists.',
        });
    }
    return true;
}
