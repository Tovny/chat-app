import 'reflect-metadata';
import express from 'express';
import { SqlDataSource } from './utils/db';
import { User } from './entity/User.model';

const app = express();

app.listen(process.env.PORT || 5000, async () => {
    try {
        await SqlDataSource.initialize();
        const user = new User();
        user.email = 'as@as.com';
        user.password = 'asdf';
        user.username = 'asdf';
        await SqlDataSource.getRepository(User).save(user);
    } catch (err) {
        console.error(err);
    }
});
