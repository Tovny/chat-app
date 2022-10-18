import { NextFunction } from 'express';
import { ResponseError } from '../types';

export function handleRequestError(
    error: Error,
    statusCode: number,
    next: NextFunction
) {
    (error as ResponseError).statusCode = statusCode;
    next(error);
}
