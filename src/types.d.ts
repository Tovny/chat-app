import { Request as ExpressRequest } from 'express';
import { User } from './entity/User.model';

export interface Request extends ExpressRequest {
    user: User;
    error: ResponseError;
}

export interface ResponseError extends Partial<Error> {
    statusCode: number;
}
