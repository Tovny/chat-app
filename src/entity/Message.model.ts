import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { Room } from './Room.model';
import { User } from './User.model';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    public id: string;

    @ManyToOne(() => User, (user) => user.messages)
    public user: User;

    @ManyToOne(() => Room, (room) => room.messages)
    public room: Room;

    @Column()
    public content: string;

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
