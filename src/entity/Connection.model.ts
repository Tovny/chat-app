import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User.model';

@Entity()
export class Connection {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => User, (user) => user.connections)
    public user: User;
}
