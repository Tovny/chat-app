import { NextFunction, Response } from 'express';
import { Request } from '../types';
import { getRoomUserUtil } from '../utils/get-room-user.util';

export async function getRoomUser(
    req: Request,
    _: Response,
    next: NextFunction
) {
    const { roomId, roomUserId } = req.params;
    const roomUser = await getRoomUserUtil({
        userId: req.user.id,
        roomId,
        roomUserId,
    });
    req.roomUser = roomUser;
    next();
}
