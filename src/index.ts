import 'reflect-metadata';
import express from 'express';
import { SqlDataSource } from './utils/db.util';
import { roomRouter } from './routes/room.routes';
import { json } from 'body-parser';
import { getUser } from './middleware/get-user.middleware';
import { errorHandler } from './middleware/handle-error.middleware';

const app = express();

app.use(json());

app.use(getUser);

app.use('/rooms', roomRouter);

app.use(errorHandler as any);

const port = process.env.PORT || 5000;
app.listen(port, async () => {
    try {
        await SqlDataSource.initialize();
        console.log(`Server running on port ${port}`);
    } catch (err) {
        console.error(err);
    }
});
