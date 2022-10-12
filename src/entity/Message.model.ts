import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
} from 'typeorm';
import { RoomMessage } from './RoomMessage.model';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    public id: string;

    @OneToOne(() => RoomMessage, (roomMessage) => roomMessage.message)
    public room: RoomMessage;

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
