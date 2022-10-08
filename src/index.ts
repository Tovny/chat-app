import 'reflect-metadata';
import express from 'express';
import { SqlDataSource } from './utils/db';
import { User } from './entity/User.model';

const app = express();

app.listen(process.env.PORT || 5000, async () => {
    try {
        await SqlDataSource.initialize();
    } catch (err) {
        console.error(err);
    }
});
