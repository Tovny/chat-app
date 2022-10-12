import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Message } from './Message.model';
import { User } from './User.model';

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    public id: string;

    @Column()
    public name: string;

    @Column()
    public password: string;

    @OneToMany(() => User, (user) => user.rooms)
    public users: User[];

    @OneToMany(() => Message, (message) => message.room)
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
