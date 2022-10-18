import { NextFunction } from 'express';
import { ResponseError } from '../types';

export function handleRequestError(
    error: ResponseError,
    statusCode: number,
    next: NextFunction
) {
    error.statusCode = statusCode;
    next(error);
}
