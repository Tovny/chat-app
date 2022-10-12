import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany,
    ManyToOne,
} from 'typeorm';
import { Room } from './Room.model';
import { User } from './User.model';

@Entity()
export class RoomUser {
    @PrimaryGeneratedColumn()
    public id: string;

    @ManyToOne(() => User, (user) => user.rooms)
    public user: User;

    @ManyToOne(() => Room, (room) => room.users)
    public room: Room;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
    })
    public created_at: Date;
}
