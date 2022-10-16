import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Message } from './Message.model';
import { RoomUser } from './RoomUser.model';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    public id: string;

    @Column()
    public username: string;

    @Column()
    public email: string;

    @Column()
    public password: string;

    @OneToMany(() => RoomUser, (roomUser) => roomUser.user)
    public rooms: RoomUser[];

    @OneToMany(() => Message, (room) => room.user)
    public messages: Message[];

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
