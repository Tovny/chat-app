import { Message } from '../entity/Message.model';
import { Room } from '../entity/Room.model';
import { SqlDataSource } from './db.util';

export const getRoom = async (id: string, limit = 10, skip = 0) => {
    const room = await SqlDataSource.getRepository(Room)
        .createQueryBuilder('room')
        .select(['room.id', 'room.name'])
        .where('room.id = :roomID', { roomID: id })
        .leftJoinAndSelect('room.users', 'roomUsers')
        .leftJoin('roomUsers.user', 'user')
        .addSelect(['user.username', 'user.id'])
        .loadRelationCountAndMap('room.messageTotal', 'room.messages')
        .getOne();
    let offset = room['messageTotal'] - skip - limit;
    if (offset < 0) {
        offset = 0;
    }
    const messages = await SqlDataSource.getRepository(Message)
        .createQueryBuilder('messages')
        .where('messages.room.id = :id', { id })
        .addOrderBy('messages.created_at')
        .offset(offset)
        .limit(limit)
        .leftJoin('messages.user', 'msgUser')
        .addSelect(['msgUser.username', 'msgUser.id'])
        .leftJoin('messages.room', 'msgRoom')
        .addSelect('msgRoom.id')
        .getMany();
    room.messages = messages;
    return room;
};
