import { RoomUser } from '../entity/RoomUser.model';
import { SqlDataSource } from '../utils/db.util';

export const getRoomUserUtil = async ({
    userId,
    roomId,
    roomUserId,
}: {
    userId: string;
    roomId?: string;
    roomUserId?: string;
}) => {
    const query =
        SqlDataSource.getRepository(RoomUser).createQueryBuilder('roomUser');
    if (roomUserId) {
        query.andWhere('roomUser.id = :roomUserId', { roomUserId });
    }
    if (roomId) {
        query.andWhere('roomUser.room.id = :roomId', { roomId });
    }
    return await query
        .andWhere('roomUser.user.id = :userId', { userId })
        .leftJoin('roomUser.user', 'user')
        .addSelect(['user.id', 'user.username', 'user.email'])
        .leftJoin('roomUser.room', 'room')
        .addSelect(['room.id', 'room.name'])
        .getOne();
};
