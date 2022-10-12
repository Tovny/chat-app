import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Connection } from './Connection.model';
import { RoomMessage } from './RoomMessage.model';
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

    @OneToMany(() => RoomUser, (room) => room.user)
    public rooms: RoomUser[];

    @OneToMany(() => RoomMessage, (message) => message.user)
    public messages: RoomMessage[];

    @OneToMany(() => Connection, (connection) => connection.user)
    public connections: Connection[];

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
