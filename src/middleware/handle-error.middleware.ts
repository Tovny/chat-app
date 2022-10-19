import { NextFunction, Response } from 'express';
import { Request } from '../types';
import { ResponseError } from '../utils/response-error.util';

export function errorHandler(
    err: ResponseError,
    __: Request,
    res: Response,
    ___: NextFunction
) {
    console.error(err);
    res.status(err.statusCode).send(err.message);
}
