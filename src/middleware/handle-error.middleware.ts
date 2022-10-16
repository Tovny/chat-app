import { NextFunction, Response } from 'express';
import { Request, ResponseError } from '../types';

export function errorHandler(
    err: ResponseError,
    __: Request,
    res: Response,
    ___: NextFunction
) {
    console.error(err);
    res.status(err.statusCode).json(err);
}
