import { Router } from 'express';
import { body } from 'express-validator';
import { validateInput } from '../middleware/validate-input.middleware';
import { SqlDataSource } from '../utils/db.util';
import { User } from '../entity/User.model';
import { compare } from 'bcrypt';
import { postLogin, postRegister } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post(
    '/login',
    validateInput([
        body('username')
            .isLength({ min: 4 })
            .custom(async (username: string, { req }) => {
                const { password } = req.body;
                const repo = SqlDataSource.getRepository(User);
                const user = await repo.findOneBy({ username });
                if (!user) {
                    return Promise.reject({
                        statusCode: 400,
                        msg: 'User with username does not exist.',
                    });
                }
                const passMatches = await compare(password, user.password);
                if (!passMatches) {
                    return Promise.reject({
                        statusCode: 403,
                        msg: 'Password does not match.',
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
                            msg: 'Username taken.',
                        });
                    }
                    return Promise.reject({
                        statusCode: 403,
                        msg: 'User with email already exists.',
                    });
                }
            }),
        body('email').isEmail(),
        body('password').isAlphanumeric().isLength({ min: 4 }),
    ]),
    postRegister
);
