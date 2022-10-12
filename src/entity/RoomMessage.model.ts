import {
    Entity,
    CreateDateColumn,
    PrimaryGeneratedColumn,
    ManyToOne,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { Message } from './Message.model';
import { Room } from './Room.model';
import { User } from './User.model';

@Entity()
export class RoomMessage {
    @PrimaryGeneratedColumn()
    public id: number;

    @OneToOne(() => Message, (message) => message.room)
    @JoinColumn()
    public message: Message;

    @ManyToOne(() => User, (user) => user.messages)
    public user: User;

    @ManyToOne(() => Room, (room) => room.messages)
    public room: Room;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
    })
    public created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
    })
    public updated_at: Date;
}
