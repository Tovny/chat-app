import { verify } from 'jsonwebtoken';
import { User } from '../entity/User.model';

export const decodeUserJwt = (token: string): User | undefined => {
    if (!token) {
        return undefined;
    }
    const tokenData = token.split('bearer token ')[1];
    if (!tokenData) {
        return undefined;
    }
    const decoded = verify(tokenData, process.env.JWT_SECRET) as User;
    return decoded;
};
