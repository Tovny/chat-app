import { verify } from 'jsonwebtoken';
import { User } from '../entity/User.model';

export const decodeUserJwt = (
    token: string | undefined,
    prepend = 'bearer token '
): User | undefined => {
    if (!token) {
        return undefined;
    }
    let tokenData = token;
    if (prepend) {
        tokenData = token.split('bearer token ')[1];
    }
    if (!tokenData) {
        return undefined;
    }
    try {
        const decoded = verify(tokenData, process.env.JWT_SECRET) as User;
        return decoded;
    } catch(err) {
        return undefined
    }
};
