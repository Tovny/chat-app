import { DataSource } from 'typeorm';
import { Room } from '../entity/Room.model';
import { User } from '../entity/User.model';
import { Message } from '../entity/Message.model';
import { config } from 'dotenv';
import { Connection } from '../entity/Connection.model';

config();

export const SqlDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    migrationsRun: false,
    logging: true,
    entities: [User, Room, Message, Connection],
    subscribers: [],
    migrations: ['../migrations/**'],
});
