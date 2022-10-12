import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
    JoinColumn,
} from 'typeorm';
import { Connection } from './Connection.model';
import { Message } from './Message.model';
import { Room } from './Room.model';

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

    @ManyToMany(() => Room, (room) => room.users)
    @JoinColumn()
    public rooms: Room[];

    @OneToMany(() => Message, (room) => room.user)
    public messages: Message[];

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
