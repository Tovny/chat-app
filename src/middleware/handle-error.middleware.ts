import { NextFunction, Response } from 'express';
import { ResponseError } from '../types';

export function errorHandler(
    err: ResponseError,
    __: Request,
    res: Response,
    ___: NextFunction
) {
    console.error(err);
    res.status(err.statusCode).send(err.message);
}
