import { Room } from '../entity/Room.model';
import { SqlDataSource } from './db.util';

export const getRoom = async (id: string) => {
    return await SqlDataSource.getRepository(Room)
        .createQueryBuilder('room')
        .select(['room.id', 'room.name'])
        .where('room.id = :roomID', { roomID: id })
        .leftJoinAndSelect('room.messages', 'message')
        .leftJoinAndSelect('room.users', 'roomUsers')
        .leftJoin('roomUsers.user', 'user')
        .addSelect(['user.username', 'user.id'])
        .getOne();
};
