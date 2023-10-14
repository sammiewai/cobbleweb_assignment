import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class Client {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    avatar: string

    @Column("text", {array: true})
    photos: string[]

    @OneToMany(() => User, (user) => user.id, {
        cascade: true
    })
    user: User
}