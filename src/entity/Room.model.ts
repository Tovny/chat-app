import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { RoomMessage } from './RoomMessage.model';
import { RoomUser } from './RoomUser.model';

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    public id: string;

    @Column()
    public name: string;

    @Column()
    public password: string;

    @OneToMany(() => RoomUser, (user) => user.room)
    public users: RoomUser[];

    @OneToMany(() => RoomMessage, (message) => message.room)
    public messages: RoomMessage[];

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
