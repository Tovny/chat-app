import { NextFunction } from 'express';
import { ResponseError } from '../types';

export function handleError(
    error: ResponseError,
    statusCode: number,
    next: NextFunction
) {
    error.statusCode = statusCode;
    next(error);
}
