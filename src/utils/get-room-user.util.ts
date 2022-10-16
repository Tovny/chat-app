import { SqlDataSource } from '../utils/db.util';

export const getRoomUser = async (userID: string, roomID: string) => {
    return await SqlDataSource.getRepository(getRoomUser)
        .createQueryBuilder('roomUser')
        .where('roomUser.user.id = :userID', {
            userID,
        })
        .andWhere('roomUser.room.id = :roomID', { roomID })
        .getOne();
};
