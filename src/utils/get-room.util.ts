import { Room } from '../entity/Room.model';
import { SqlDataSource } from './db.util';

export const getRoom = async (id: string, limit = 10, skip = 0) => {
    return await SqlDataSource.getRepository(Room)
        .createQueryBuilder('room')
        .select(['room.id', 'room.name'])
        .where('room.id = :roomID', { roomID: id })
        .leftJoinAndSelect('room.users', 'roomUsers')
        .leftJoin('roomUsers.user', 'user')
        .addSelect(['user.username', 'user.id'])
        .leftJoinAndSelect('room.messages', 'messages')
        .skip(skip)
        .limit(limit)
        .leftJoin('messages.user', 'msgUser')
        .addSelect(['msgUser.username', 'msgUser.id'])
        .leftJoin('messages.room', 'msgRoom')
        .addSelect('msgRoom.id')
        .getOne();
};
