import { Router } from 'express';
import { body } from 'express-validator';
import { validateInput } from '../middleware/validate-input.middleware';
import { postLogin, postRegister } from '../controllers/auth.controller';
import {
    isValidPostUserData,
    isValidUserData,
} from '../validators/auth.validators';
import { getUserByUsernameOrEmail } from '../middleware/get-user.middlewares';

export const authRouter = Router();

const lengthMessage = 'needs to be at least 4 characters long.';

authRouter.post(
    '/login',
    getUserByUsernameOrEmail,
    validateInput([
        body('password')
            .isLength({ min: 4 })
            .withMessage(lengthMessage)
            .custom(isValidUserData),
    ]),
    postLogin
);

authRouter.post(
    '/register',
    getUserByUsernameOrEmail,
    validateInput([
        body('username')
            .isLength({ min: 4 })
            .withMessage(lengthMessage)
            .custom(isValidPostUserData),
        body('email').isEmail().withMessage('not valid'),
        body('password')
            .isAlphanumeric()
            .withMessage('contains invalid characters.')
            .isLength({ min: 4 })
            .withMessage(lengthMessage),
    ]),
    postRegister
);
