import { Router } from 'express';
import { body } from 'express-validator';
import { validateInput } from '../middleware/validate-input.middleware';
import { SqlDataSource } from '../utils/db.util';
import { User } from '../entity/User.model';
import { compare } from 'bcrypt';
import { postLogin, postRegister } from '../controllers/auth.controller';

export const authRouter = Router();

const lengthMessage = 'needs to be at least 4 characters long.';

authRouter.post(
    '/login',
    validateInput([
        body('username')
            .isLength({ min: 4 })
            .withMessage(lengthMessage)
            .custom(async (username: string, { req }) => {
                const { password } = req.body;
                const repo = SqlDataSource.getRepository(User);
                const user = await repo.findOneBy({ username });
                if (!user) {
                    return Promise.reject({
                        statusCode: 400,
                        message: 'User with username does not exist.',
                    });
                }
                const passMatches = await compare(password, user.password);
                if (!passMatches) {
                    return Promise.reject({
                        statusCode: 401,
                        message: 'Password does not match.',
                    });
                }
            }),
    ]),
    postLogin
);

authRouter.post(
    '/register',
    validateInput([
        body('username')
            .isLength({ min: 4 })
            .withMessage(lengthMessage)
            .custom(async (username: string, { req }) => {
                const { email } = req.body;
                const user = await SqlDataSource.getRepository(User)
                    .createQueryBuilder('user')
                    .where('username = :username OR email = :email', {
                        username,
                        email,
                    })
                    .getOne();

                if (user) {
                    if (user.username === username) {
                        return Promise.reject({
                            statusCode: 403,
                            message: 'Username taken.',
                        });
                    }
                    return Promise.reject({
                        statusCode: 403,
                        message: 'User with email already exists.',
                    });
                }
            }),
        body('email').isEmail().withMessage('not valid'),
        body('password')
            .isAlphanumeric()
            .withMessage('contains invalid characters.')
            .isLength({ min: 4 })
            .withMessage(lengthMessage),
    ]),
    postRegister
);
