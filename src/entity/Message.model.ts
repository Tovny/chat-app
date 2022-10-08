import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { Room } from './Room.model';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    public id: string;

    @Column()
    public userID: string;

    @Column()
    public username: string;

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
