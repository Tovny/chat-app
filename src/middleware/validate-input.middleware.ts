import { NextFunction, Response } from 'express';
import { Request } from '../types';
import { ValidationChain, validationResult } from 'express-validator';

export function validateInput(validators: ValidationChain[]) {
    return async function validateInput(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        await Promise.all(validators.map((validation) => validation.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const [error] = errors.array();
            if (typeof error.msg === 'object') {
                return res.status(error.msg.statusCode).send(error.msg.message);
            }
            return res
                .status(403)
                .send(`${error.param.toLocaleUpperCase()} ${error.msg}`);
        }
        next();
    };
}
